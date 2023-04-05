import { createHmac } from 'crypto'
import cors from 'cors'
import Web3 from 'web3'
import { ThirdwebSDK } from '@thirdweb-dev/sdk'

import { getContractAddressesFromGate, getProductGates } from './api/gates.js'
import {airdropItem, createAirdrop} from './api/airdrops.js'

const sdk = new ThirdwebSDK('mumbai')
const web3 = new Web3()

export function configurePublicApi(app) {
  // this should be limited to app domains that have your app installed
  const corsOptions = {
    origin: '*'
  }

  // Configure CORS to allow requests to /public from any origin
  // enables pre-flight requests
  app.options('/public/*', cors(corsOptions))

  app.post('/public/airdrop/redeem', cors(corsOptions), async (req, res) => {
    const { wallet, item } = req.body
    try {
      await airdropItem(wallet, item);
      res.status(200).json({ ok: true })
    } catch(error) {
      res.status(500).json({ error })
    }
  })

  app.post('/public/gates', cors(corsOptions), async (req, res) => {
    const { shopDomain, productGid } = req.body
    const gates = await getProductGates({ shopDomain, productGid })
    res.status(200).send(gates)
  })

  app.post('/public/gateEvaluation', cors(corsOptions), async (req, res) => {
    // evaluate the gate, message, and signature
    const { shopDomain, productGid, address, message, signature, gateConfigurationGid } = req.body

    // not shown: verify the content of the message

    // verify signature
    const recoveredAddress = web3.eth.accounts.recover(message, signature)
    if (recoveredAddress !== address) {
      res.status(403).send('Invalid signature')
      return
    }

    // retrieve relevant contract addresses from gates
    const requiredContractAddresses = await getContractAddressesFromGate({ shopDomain, productGid })

    // now lookup nfts
    const unlockingTokens = await retrieveUnlockingTokens(address, requiredContractAddresses)
    if (unlockingTokens.length === 0) {
      res.status(403).send('No unlocking tokens')
      return
    }

    const payload = {
      id: gateConfigurationGid
    }

    const response = { gateContext: [getHmac(payload)], unlockingTokens }
    res.status(200).send(response)
  })
}

function getHmac(payload) {
  if (!payload.id) throw new Error('payload.id is required')
  const hmacMessage = payload.id
  const hmac = createHmac('sha256', '0b563729acf5dcd71e56fb4a4b97bbf31f43')
  hmac.update(hmacMessage)
  const hmacDigest = hmac.digest('hex')
  return {
    id: payload.id,
    hmac: hmacDigest
  }
}

async function retrieveUnlockingTokens(address, contractAddresses) {
  const contracts = contractAddresses.map(async (contractAddress) => {
    const contract = await sdk.getContract(contractAddress)
    const owned = await contract.erc721.getOwned(address)
    const items = owned.map(async (nft) => ({
      name: nft.metadata.name,
      imageUrl: nft.metadata.image,
      collectionName: (await contract.metadata.get()).name,
      contractAddress
    }))
    return Promise.all(items)
  })
  const data = await Promise.all(contracts)
  return data.flat()
}
