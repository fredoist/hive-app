# Hive App

Hive App enables merchants to offer token gated experiences to customers, creating their own collections of tokens within the embedded app and adding exclusive discounts for token owners of a contract.

![Preview](.github/preview-drop.png)

### Features

The following features are supported:

- [x] Collection minting: merchants can create and mint a new NFT collection inside the app so they don't have to go somewhere else for it.
- [x] Gated Content: merchants can offer a discount amount or percentage to owners of one or more collections, discounts are automatically applied if customer meets the requirements.
- [x] Loyalty Programs: merchants can offer more than gated content, they can also offer customers post-purchase offers, like airdroping them an NFT after a purchase is made.
- [ ] Reward Coins: merchants can create their own token for their shop and use it as a rewarding system for customers, where they get an ammount of coins after each purchase; customers can later trade coins or redeem for promotions. Coins could also be accepted as a currency within the shop or other sites.

### Demo video

[![fredoist/hive-app: Token gated experiences inside Shopify using Thirdweb SDK and Shopify Gates API. - 2 April 2023](https://cdn.loom.com/sessions/thumbnails/6bc5a87cd12f4ab39d07866c242f9fe0-with-play.gif)](https://www.loom.com/share/6bc5a87cd12f4ab39d07866c242f9fe0)

Try it yourself: https://hive-app-store-demo.myshopify.com/products/the-collection-snowboard-liquid
Try the app at: https://hive-app-landing.fredoist.repl.co/

### Installation

- Clone the repository
- Run `npm install` on root directory.
- Run `npm run deploy` and follow the instructions to create a shopify app and push the extensions.
- Copy your `FUNCTION_ID` env variable and paste it inside `web/api/create-discount.js`
- Run `npm run dev`
- Replace the host variable for your ngrok.io tunnel on `extensions/tokengate-src/useEvaluateGate.js`, `extensions/tokengate/blocks/app-block.liquid`.
- Run `npm run build --prefix extensions/tokengate-src`
