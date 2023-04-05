// @ts-check
import { join } from 'path'
import { readFileSync } from 'fs'
import express from 'express'
import serveStatic from 'serve-static'

import shopify from './shopify.js'
import retrieveGates from './api/retrieve-gates.js'
import createGate from './api/create-gate.js';
import deleteGate from './api/delete-gate.js';

import { configurePublicApi } from './public-api.js'
import { createAirdrop } from './api/airdrops.js'

const { PORT = 3000 } = process.env

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`

const app = express()

app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
)

app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: {} }))

app.use(express.json())
configurePublicApi(app)
app.use('/api/*', shopify.validateAuthenticatedSession())

app.post('/api/airdrops', async (req, res) => {
  const { name, address, productGid } = req.body
  try {
    const metafields = await createAirdrop({ session: res.locals.shopify.session, name, address, productGid });
    res.status(200).json({ metafields })
  } catch (error) {
    console.error('Failed to process airdrop/create:', error)
    res.status(500).json({ error })
  }
})

app.get('/api/gates', async (_, res) => {
  try {
    const response = await retrieveGates(res.locals.shopify.session)
    res.status(200).send({ success: true, response })
  } catch (e) {
    console.error('Failed to process gates/get:', e.message)
    res.status(500).send({ success: false, error: e.message })
  }
})
app.post('/api/gates', async (req, res) => {
  const { name, discountType, discount, segment, productGids } = req.body

  try {
    await createGate({
      session: res.locals.shopify.session,
      name,
      discountType,
      discount,
      segment,
      productGids
    })
    res.status(200).send({ success: true })
  } catch (e) {
    console.error('Failed to process gates/create:', e.message)
    res.status(500).send({ success: false, error: e.message })
  }
})
app.delete('/api/gates/:id', async (req, res) => {
  try {
    await deleteGate({
      session: res.locals.shopify.session,
      gateConfigurationGid: decodeURIComponent(req.params.id)
    })
    res.status(200).send({ success: true })
  } catch (e) {
    console.error('Failed to process gates/delete:', e.message)
    res.status(500).send({ success: false, error: e.message })
  }
})

app.use(serveStatic(STATIC_PATH, { index: false }))

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')))
})

app.listen(PORT)
