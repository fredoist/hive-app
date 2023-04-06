/**
 * Extend Shopify Checkout with a custom Post Purchase user experience.
 * This template provides two extension points:
 *
 *  1. ShouldRender - Called first, during the checkout process, when the
 *     payment page loads.
 *  2. Render - If requested by `ShouldRender`, will be rendered after checkout
 *     completes
 */
import React, { useCallback, useState } from 'react';

import {
  extend,
  render,
  BlockStack,
  Button,
  CalloutBanner,
  Heading,
  Image,
  Layout,
  TextBlock,
  TextContainer,
  View,
  TextField,
  useExtensionInput,
} from "@shopify/post-purchase-ui-extensions-react";

/**
 * Entry point for the `ShouldRender` Extension Point.
 *
 * Returns a value indicating whether or not to render a PostPurchase step, and
 * optionally allows data to be stored on the client for use in the `Render`
 * extension point.
 */
extend("Checkout::PostPurchase::ShouldRender", async ({ inputData, storage }) => {
  const items = inputData.initialPurchase.lineItems;
  const products = items.map(item => item.product)
  const metafields = products.flatMap(product => product.metafields)
  const shouldRender = metafields.every(field => field.key === 'airdrop' && field.namespace === 'hive-app_airdrop')

  if (shouldRender) {
    const item = metafields.filter(field => field.key === 'airdrop' && field.namespace === 'hive-app_airdrop')
    await storage.update({
      data: JSON.parse(item[0].value)
    });
  }

  return {
    render: shouldRender,
  };
});

/**
* Entry point for the `Render` Extension Point
*
* Returns markup composed of remote UI components.  The Render extension can
* optionally make use of data stored during `ShouldRender` extension point to
* expedite time-to-first-meaningful-paint.
*/
render("Checkout::PostPurchase::Render", () => <App />);

// Top-level React component
export function App() {
  const { storage, extensionPoint } = useExtensionInput()
  const data = storage.data
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState('')
  const [airdropped, setAirdropped] = useState(false)

  return (
    <BlockStack spacing="loose">
      {airdropped ? <CalloutBanner>Congratulations, you've been awarded {data?.metadata.name}</CalloutBanner> : null}
      <Layout
        maxInlineSize={0.95}
        media={[
          { viewportSize: "small", sizes: [1, 30, 1] },
          { viewportSize: "medium", sizes: [300, 30, 0.5] },
          { viewportSize: "large", sizes: [400, 30, 0.33] },
        ]}
      >
        <View>
          <Image source={data?.metadata.image} />
        </View>
        <View />
        <BlockStack spacing="xloose">
          <TextContainer>
            <Heading>Claim {airdrop?.metadata.name}</Heading>
            <TextBlock>
              This purchase gave you a special digital collectible, claim it by entering your wallet address.
            </TextBlock>
          </TextContainer>
          <TextField name='wallet' label='0x75989BDe13C69bcA08C32398d749f8745cc725F6' required onChange={setWallet} />
          <Button
            submit
            loading={loading}
            disabled={loading || airdropped}
            onPress={async () => {
              setLoading(true)
              const req = await fetch('https://hive-app.fly.dev/api/public/airdrops', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  wallet,
                  item: data
                })
              })
              if (req.ok) {
                setAirdropped(true)
              }
              setLoading(false)
            }}
          >
            Claim now
          </Button>
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}