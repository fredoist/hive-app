import {
  Layout,
  Page,
  EmptyState,
  IndexTable,
  LegacyCard,
  EmptySearchResult,
} from '@shopify/polaris';
import { ConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';
import { walletImage } from '../../assets';

export default function CollectiblesPage() {
  const address = useAddress();
  const sdk = useSDK();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    if (!address) return;
    sdk.getContractList(address).then((data) => {
      setContracts(
        data.map((contract) => {
          const contractType = contract.contractType().then((data) => data);
          if (contractType !== 'nft-collection' || contract.chainId !== 80001) {
            return null;
          }
          const metadata = contract.metadata().then((data) => data);
          return {
            address: contract.address,
            name: metadata.name ?? 'No name',
            description: metadata.description ?? 'No description',
            symbol: metadata.symbol ?? 'No symbol',
          };
        }).filter(Boolean)
      );
    });
  }, [address]);

  return (
    <Page
      compactTitle
      title="Collectibles"
      subtitle="Reward your customers and collab with other brands by offering
              unique collectibles to your customers."
      primaryAction={{
        content: 'Create collection',
        disabled: !address,
        onAction: () => alert('Create collection'),
        helpText:
          !address &&
          'You need to connect a digital wallet to create your collectibles',
      }}
    >
      <Layout>
        <Layout.Section>
          {address ? (
            <LegacyCard>
              <IndexTable
                resourceName={{ plural: 'collections', singular: 'collection' }}
                headings={[
                  { title: 'Name' },
                  { title: 'Description' },
                  { title: 'Symbol' },
                ]}
                itemCount={contracts.length}
                selectable={false}
                emptyState={
                  <EmptySearchResult
                    title={'No collections found'}
                    description={'Get started by creating a collection'}
                    withIllustration
                  />
                }
              >
                {contracts.map((contract) => (
                  <IndexTable.Row key={contract.address}>
                    <IndexTable.Cell>{contract.name}</IndexTable.Cell>
                    <IndexTable.Cell>{contract.description}</IndexTable.Cell>
                    <IndexTable.Cell>{contract.symbol}</IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </LegacyCard>
          ) : (
            <EmptyState heading="Connect your wallet" image={walletImage}>
              <p style={{ marginBottom: '3rem' }}>
                You need to connect a digital wallet to create your collectibles
              </p>
              <ConnectWallet />
            </EmptyState>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
