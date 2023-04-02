import { myAppMetafieldNamespace } from './constants.js'

const YOUR_FUNCTION_ID = '01GX00Z169PR6K7C82MNS2HQFF'

const DISCOUNT_FUNCTION_QUERY = `
query discountFunctionQuery {
  automaticDiscountNodes(first: 10) {
    edges {
      node {
        id
        automaticDiscount {
          ... on DiscountAutomaticApp {
            discountId
            title
            appDiscountType {
              functionId
            }
          }
        }
        metafield(namespace: "${myAppMetafieldNamespace}", key: "gate_configuration_id") {
          value
        }
      }
    }
  }
}
`

const CREATE_AUTOMATIC_DISCOUNT_MUTATION = `
mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
  discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
    userErrors {
      code
      field
      message
    }
  }
}
`

export const createAutomaticDiscount = async (client, gateConfiguration) => {
  const shouldCreateDiscount = await noMatchingFunction(client, gateConfiguration)
  if (shouldCreateDiscount) {
    await client.query({
      data: {
        query: CREATE_AUTOMATIC_DISCOUNT_MUTATION,
        variables: {
          automaticAppDiscount: {
            title: gateConfiguration.name,
            functionId: YOUR_FUNCTION_ID,
            combinesWith: {
              productDiscounts: true,
              shippingDiscounts: true
            },
            startsAt: new Date(),
            metafields: [
              {
                key: 'gate_configuration_id',
                namespace: myAppMetafieldNamespace,
                type: 'single_line_text_field',
                value: gateConfiguration.id
              }
            ]
          }
        }
      }
    })
  }
}

const noMatchingFunction = async (client, gateConfiguration) => {
  const response = await client.query({
    data: {
      query: DISCOUNT_FUNCTION_QUERY
    }
  })

  if (!Boolean(response?.body?.data?.automaticDiscountNodes?.edges)) return true
  response.body.data.automaticDiscountNodes.edges.forEach((edge) => {
    const functionId = edge.node.automaticDiscount.appDiscountType.functionId
    const gateConfigurationId = edge.node.metafield.value
    if (YOUR_FUNCTION_ID == functionId && gateConfiguration.id == gateConfigurationId) return false
  })

  return true
}
