import shopify from '../shopify.js'
import { myAppMetafieldNamespace } from './constants.js'

export async function getProductGates({ shopDomain, productGid }) {
  const response = await getGatesByShopDomain({ shopDomain, productGid })
  try {
    const gates = response.product.gates?.map((gate) => ({
      id: gate.configuration.id,
      name: gate.configuration.name,
      requirements: JSON.parse(gate.configuration.requirements.value),
      reaction: JSON.parse(gate.configuration.reaction.value)
    }))
    return gates
  } catch (e) {
    console.error('error parsing gate requirements', e)
    return []
  }
}

export async function getContractAddressesFromGate({ shopDomain, productGid }) {
  const response = await getGatesByShopDomain({ shopDomain, productGid })
  try {
    const requirements = JSON.parse(response.product.gates?.[0]?.configuration?.requirements?.value)
    const contractAddresses = requirements?.conditions.map((condition) => condition.contractAddress)
    return contractAddresses
  } catch (e) {
    console.error('error parsing gate requirements', e)
    return []
  }
}

async function getSessionByShopDomain({ shopDomain }) {
  try {
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain)
    if (!sessions || sessions.length === 0) return null

    return sessions[0]
  } catch (error) {
    console.error('error finding session for shop', shopDomain, error)
    return null
  }
}

export async function getGatesByShopDomain({ shopDomain, productGid }) {
  const client = new shopify.api.clients.Graphql({
    session: await getSessionByShopDomain({ shopDomain }),
    apiVersion: 'unstable'
  })
  const data = {
    query,
    variables: {
      productGid
    }
  }

  try {
    const response = await client.query({
      data
    })

    return response.body.data
  } catch (error) {
    console.error('error executing gates query', error.message, error.response)
    return null
  }
}

const query = `
query FetchProductGates($productGid: ID!) {
  product(id: $productGid) {
    gates {
      id
      active
      configuration {
        id
        name
        requirements: metafield(namespace: "${myAppMetafieldNamespace}", key: "requirements") {
          value
        }
        reaction: metafield(namespace: "${myAppMetafieldNamespace}", key: "reaction") {
          value
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
}
`
