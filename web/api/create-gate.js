import { GraphqlQueryError } from '@shopify/shopify-api'
import shopify from '../shopify.js'
import { myAppMetafieldNamespace, myAppHandle } from './constants.js'
import { createAutomaticDiscount } from './create-discount.js'

const CREATE_GATE_CONFIGURATION_MUTATION = `
mutation gateConfigurationCreate($name: String!, $requirements: String!, $reaction: String!) {
  gateConfigurationCreate(input: {
    handle: "${myAppHandle}"
    name: $name
    metafields: [{
      namespace: "${myAppMetafieldNamespace}"
      key: "requirements"
      value: $requirements
      type: "json"
    }, {
      namespace: "${myAppMetafieldNamespace}"
      key: "reaction"
      value: $reaction
      type: "json"
    }]
  }) {
    userErrors {
      field
      message
    }
    gateConfiguration {
      id
      name
      handle
      requirements: metafield(namespace: "${myAppMetafieldNamespace}", key: "requirements") {
        id
        key
        type
        value
        namespace
      }
      reaction: metafield(namespace: "${myAppMetafieldNamespace}", key: "reaction") {
        id
        key
        type
        value
        namespace
      }
      createdAt
      updatedAt
    }
  }
}
`

const CREATE_GATE_SUBJECT_MUTATION = `
mutation gateSubjectCreate($gateConfigurationId: ID!, $subject: ID!) {
  gateSubjectCreate(input: {
    gateConfigurationId: $gateConfigurationId
    subject: $subject
    active: true
  }) {
    userErrors {
      field
      message
    }
    gateSubject {
      id
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
      active
      createdAt
      updatedAt
    }
  }
}
`
const UPDATE_GATE_SUBJECT_MUTATION = `
mutation gateSubjectUpdate($gateConfigurationId: ID!, $id: ID!) {
  gateSubjectUpdate(input: {
    id: $id
    gateConfigurationId: $gateConfigurationId
  }) {
    userErrors {
      field
      message
    }
    gateSubject {
      id
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
const PRODUCTS_QUERY = `
query retrieveProducts ($queryString: String!, $first: Int!){
  products(first: $first, query: $queryString) {
    edges {
      node {
        id
        gates {
          id
          active
        }
      }
    }
  }
}
`

export default async function createGate({
  session,
  name,
  discountType,
  discount,
  segment,
  productGids
}) {
  const client = new shopify.api.clients.Graphql({ session })

  const segmentConditions = segment.map((address) => {
    return {
      name: `Gate for ${address.slice(0, 5)}`,
      conditionsDescription: 'Any token',
      contractAddress: address,
      imageUrl: 'https://placekitten.com/g/200/200'
    }
  })

  const gateConfigurationRequirements = {
    logic: 'ANY',
    conditions: segmentConditions
  }

  const gateConfigurationReaction = {
    name: name,
    type: 'discount',
    discount: {
      type: discountType,
      value: discount
    }
  }

  try {
    const createGateResponse = await client.query({
      data: {
        query: CREATE_GATE_CONFIGURATION_MUTATION,
        variables: {
          name,
          requirements: JSON.stringify(gateConfigurationRequirements),
          reaction: JSON.stringify(gateConfigurationReaction)
        }
      }
    })
    const gateConfiguration = createGateResponse.body.data.gateConfigurationCreate.gateConfiguration
    const gateConfigurationId = gateConfiguration.id

    createAutomaticDiscount(client, gateConfiguration)

    if (productGids.length === 0) {
      return
    }

    const retrieveProductsResponse = await client.query({
      data: {
        query: PRODUCTS_QUERY,
        variables: {
          queryString: generateProductsQueryString(productGids),
          first: 100
        }
      }
    })

    const products = retrieveProductsResponse.body.data.products.edges

    products.forEach(async (product) => {
      if (product.node.gates.length > 0) {
        const activeGateSubjectId = product.node.gates[0].id
        await client.query({
          data: {
            query: UPDATE_GATE_SUBJECT_MUTATION,
            variables: {
              gateConfigurationId,
              id: activeGateSubjectId
            }
          }
        })
      } else {
        await client.query({
          data: {
            query: CREATE_GATE_SUBJECT_MUTATION,
            variables: {
              gateConfigurationId,
              subject: product.node.id
            }
          }
        })
      }
    })

    return createGateResponse
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`)
    } else {
      throw error
    }
  }
}

const generateProductsQueryString = (productGids) => {
  return productGids
    .map((productGid) => {
      const id = productGid.split('/').pop()
      return `(id:${id})`
    })
    .join(' OR ')
}
