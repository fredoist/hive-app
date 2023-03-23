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
  Button,
  Frame,
  Loading,
  SkeletonPage,
} from '@shopify/polaris';
import { ConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { useCallback, useEffect, useState } from 'react';
import { walletImage } from '../../assets';
import { useNavigate } from '@shopify/app-bridge-react';

export default function CollectiblesPage() {
  const address = useAddress();
  const sdk = useSDK();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [collection, setCollection] = useState({ name: '', description: '' });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    async function getContracts() {
      setIsLoading(true);
      if (!address) return;
      if (isDeploying) return;
      const contracts = await sdk.getContractList(address);
      const collections = contracts.map(async (contract) => {
        const { name, description, symbol } = await contract.metadata();
        return {
          address: contract.address,
          name,
          description,
          symbol,
        };
      });
      Promise.all(collections).then(setContracts);
      setIsLoading(false);
    }
    getContracts();
  }, [address, isDeploying]);

  const toggleModal = useCallback(() => setShowModal(!showModal), [showModal]);

  const handleCreateCollection = useCallback(async () => {
    if (!address) return;
    if (!collection.name || !collection.description) return;
    try {
      setIsDeploying(true);
      const contract = await sdk.deployer.deployNFTCollection({
        name: collection.name,
        description: collection.description,
        symbol: collection.name.slice(0, 3).toUpperCase(),
        primary_sale_recipient: address,
      });
      setIsDeploying(false);
      setShowModal(false);
      navigate(`/collectibles/${contract}`);
    } catch (error) {
      console.error(error);
      setIsDeploying(false);
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
          loading: isDeploying,
          disabled: isDeploying,
        }}
      >
        <Modal.Section>
          <AlphaStack gap="5">
            <TextField
              type="text"
              label="Name"
              disabled={isDeploying}
              value={collection.name}
              requiredIndicator
              onChange={(value) =>
                setCollection({ ...collection, name: value })
              }
            />
            <TextField
              type="text"
              label="Description"
              disabled={isDeploying}
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
              {isLoading ? (
                <Frame>
                  <SkeletonPage />
                  <Loading />
                </Frame>
              ) : (
                <IndexTable
                  resourceName={{
                    plural: 'collections',
                    singular: 'collection',
                  }}
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
                  {contracts.map(({ address, name, description, symbol }) => (
                    <IndexTable.Row key={address}>
                      <IndexTable.Cell>
                        <Button
                          plain
                          size="slim"
                          onClick={() => navigate(`/collectibles/${address}`)}
                        >
                          {name}
                        </Button>
                      </IndexTable.Cell>
                      <IndexTable.Cell>{description}</IndexTable.Cell>
                      <IndexTable.Cell>{symbol}</IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
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
