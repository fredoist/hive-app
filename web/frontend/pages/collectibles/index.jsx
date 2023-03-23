import {
  Layout,
  Page,
  EmptyState,
  IndexTable,
  LegacyCard,
  EmptySearchResult,
  Modal,
  TextField,
  AlphaStack,
} from '@shopify/polaris';
import { ConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { useCallback, useEffect, useState } from 'react';
import { walletImage } from '../../assets';
import { useNavigate } from '@shopify/app-bridge-react'

export default function CollectiblesPage() {
  const navigate = useNavigate()
  const address = useAddress();
  const sdk = useSDK();
  const [contracts, setContracts] = useState([]);
  const [collection, setCollection] = useState({ name: '', description: '' });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    sdk.getContractList(address).then((data) => {
      setContracts(
        data
          .map((contract) => {
            const contractType = contract.contractType().then((data) => data);
            if (
              contractType !== 'nft-collection' ||
              contract.chainId !== 80001
            ) {
              return null;
            }
            const metadata = contract.metadata().then((data) => data);
            return {
              address: contract.address,
              name: metadata.name ?? 'No name',
              description: metadata.description ?? 'No description',
              symbol: metadata.symbol ?? 'No symbol',
            };
          })
          .filter(Boolean)
      );
    });
  }, [address, isLoading]);

  const toggleModal = useCallback(() => setShowModal(!showModal), [showModal]);

  const handleCreateCollection = useCallback(async () => {
    if (!address) return;
    if (!collection.name || !collection.description) return;
    try {
      setIsLoading(true);
      const contract = await sdk.deployer.deployNFTCollection({
        name: collection.name,
        description: collection.description,
        symbol: collection.name.slice(0, 3).toUpperCase(),
        primary_sale_recipient: address,
      });
      setIsLoading(false);
      setShowModal(false);
      navigate(`/collectibles/${contract}`);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  });

  return (
    <Page
      compactTitle
      title="Collectibles"
      subtitle="Reward your customers and collab with other brands by offering
              unique collectibles to your customers."
      primaryAction={{
        content: 'Create collection',
        disabled: !address,
        onAction: toggleModal,
        helpText:
          !address &&
          'You need to connect a digital wallet to create your collectibles',
      }}
    >
      <Modal
        small
        title="Create a collection"
        noScroll
        instant
        open={showModal}
        onClose={toggleModal}
        primaryAction={{
          content: 'Create',
          onAction: handleCreateCollection,
          loading: isLoading,
          disabled: isLoading
        }}
      >
        <Modal.Section>
          <AlphaStack gap="5">
            <TextField
              type="text"
              label="Name"
              disabled={isLoading}
              value={collection.name}
              requiredIndicator
              onChange={(value) =>
                setCollection({ ...collection, name: value })
              }
            />
            <TextField
              type="text"
              label="Description"
              disabled={isLoading}
              value={collection.description}
              onChange={(value) =>
                setCollection({ ...collection, description: value })
              }
            />
          </AlphaStack>
        </Modal.Section>
      </Modal>
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
