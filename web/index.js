// @ts-check
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

import shopify from './shopify.js';

const { PORT = 3000 } = process.env;

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

app.post('/api/discounts', async (req, res) => {
  const { collection, discount } = req.body;
  const code = `${collection.address.slice(0,8)}-${discount}`;
  console.log(collection, discount);
  const session = res.locals.shopify.session;
  const client = new shopify.api.clients.Graphql({
    session,
  });

  try {
    await client.query({
      data: {
        query: `mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                nodes {
                  code
                }
              }
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              startsAt
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              appliesOncePerCustomer
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }`,
        variables: {
          basicCodeDiscount: {
            title: `${discount} OFF for ${collection.name} owners.`,
            code: code,
            customerSelection: {
              all: true,
            },
            startsAt: new Date().toISOString(),
            customerGets: {
              value: {
                percentage: Number(discount / 100),
              },
              items: {
                all: true,
              },
            },
            appliesOncePerCustomer: true,
          },
        },
      },
    });
    res.status(200).send({ code });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message || error.toString() });
  }
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
