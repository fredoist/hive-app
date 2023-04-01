import { createHmac } from 'crypto'
import cors from 'cors'
import Web3 from 'web3'

import { getContractAddressesFromGate, getProductGates } from './api/gates.js'

const web3 = new Web3()

export function configurePublicApi(app) {
  // this should be limited to app domains that have your app installed
  const corsOptions = {
    origin: '*'
  }

  // Configure CORS to allow requests to /public from any origin
  // enables pre-flight requests
  app.options('/public/*', cors(corsOptions))

  app.post('/public/gates', cors(corsOptions), async (req, res) => {
    const { shopDomain, productGid } = req.body
    const { requirements, reaction } = await getProductGates({ shopDomain, productGid })
    res.status(200).send({ requirements, reaction })
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
    console.log(response)
    res.status(200).send(response)
  })
}

function getHmac(payload) {
  const hmacMessage = payload.id
  const hmac = createHmac('sha256', 'secret-key')
  hmac.update(hmacMessage)
  const hmacDigest = hmac.digest('hex')
  return {
    id: payload.id,
    hmac: hmacDigest
  }
}

function retrieveUnlockingTokens(address, contractAddresses) {
  // this could be some lookup against some node or a 3rd party service like Alchemy
  return Promise.resolve([
    {
      name: 'CryptoPunk #1719',
      imageUrl:
        'https://storage.cloud.google.com/shopify-blockchain-development/images/punk1719.png',
      collectionName: 'CryptoPunks',
      contractAddress: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB'
    }
  ])
}
