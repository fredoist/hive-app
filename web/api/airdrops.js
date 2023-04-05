import { ThirdwebSDK } from "@thirdweb-dev/sdk"
import shopify from '../shopify.js'

const sdk = ThirdwebSDK.fromPrivateKey(process.env.PRIVATE_KEY, 'mumbai')

export async function airdropItem(wallet, item) {
    const contract = await sdk.getContract(item.contract)
    await contract.erc1155.claimTo(wallet, 0, 1)
}

export async function createAirdrop({ session, name, address, productGid }) {
    const client = new shopify.api.clients.Graphql({
        session,
    })

    const contract = await sdk.getContract(address)
    const metadata = await contract.metadata.get()

    const data = {
        query: PRODUCT_AIRDROP_METADATA_MUTATION,
        variables: {
            metafields: [
                {
                    key: 'airdrop',
                    namespace: 'hive-app_airdrop',
                    value: JSON.stringify({
                        metadata: metadata,
                        name: name,
                        address: address,
                    }),
                    type: 'json',
                    ownerId: productGid,
                }
            ]
        }
    }

    const metafields = await client.query({ data })
    return metafields
}

const PRODUCT_AIRDROP_METADATA_QUERY = `
query {
    metafields(first: 10) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
`	

const PRODUCT_AIRDROP_METADATA_MUTATION = `
mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
        metafields {
            key
            namespace
            value
            createdAt
            updatedAt
        }
        userErrors {
            field
            message
            code
        }
    }
}
`