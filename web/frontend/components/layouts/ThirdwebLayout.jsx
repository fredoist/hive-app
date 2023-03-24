import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';

import { walletImage } from '../../assets';

/** @param {import('@shopify/polaris').PageProps} props */
export default function ThirdwebLayout(props) {
  const address = useAddress();

  return (
    <Page {...props}>
      <Layout>
        {address ? (
          props.children
        ) : (
          <Layout.Section>
            <EmptyState heading="Connect your wallet" image={walletImage}>
              <p style={{ marginBottom: '3rem' }}>
                You need to connect a digital wallet to continue.
              </p>
              <ConnectWallet colorMode="dark" btnTitle="Connect wallet" />
            </EmptyState>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
