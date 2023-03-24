import {
  AlphaStack,
  Columns,
  DropZone,
  EmptySearchResult,
  Frame,
  IndexTable,
  Layout,
  LegacyCard,
  Loading,
  Modal,
  Page,
  SkeletonPage,
  TextField,
  Thumbnail,
} from '@shopify/polaris';
import {
  useAddress,
  useContract,
  useMetadata,
  useMintNFT,
  useNFTs,
} from '@thirdweb-dev/react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ContractPage() {
  const { contract: contractId } = useParams();
  const address = useAddress();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { contract } = useContract(contractId);
  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useMetadata(contract);
  const {
    data: collectibles,
    isLoading: isLoadingCollectibles,
    error: collectiblesError,
  } = useNFTs(contract);
  const {
    mutateAsync: mintNFT,
    isLoading: isDeploying,
    error: mintError,
  } = useMintNFT(contract);

  const toggleModal = useCallback(
    async () => setShowModal(!showModal),
    [showModal]
  );
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setImage(acceptedFiles[0]),
    []
  );
  const handleCreateCollectible = useCallback(async () => {
    if (!address) return;
    try {
      await mintNFT({
        metadata: {
          name,
          description,
          image,
        },
        to: address,
      });
      setName('');
      setDescription('');
      setImage(null);
      toggleModal();
    } catch (error) {
      console.error(error);
    }
  }, [name, description, image]);

  if (isLoadingCollection || isLoadingCollectibles)
    return (
      <Frame>
        <Loading />
        <SkeletonPage />
      </Frame>
    );
  if (collectionError || collectiblesError || mintError) {
    return (
      <Page title="Error">
        <p>There was an error loading this page.</p>
      </Page>
    );
  }
  return (
    <ThirdwebLayout
      title={`${collection.name}`}
      subtitle={collection.description}
      primaryAction={{
        content: 'Add collectible',
        onAction: toggleModal,
        disabled: !address,
        helpText: !address && 'Connect your wallet to add a collectible',
      }}
    >
      <Modal
        title={`Add collectible to ${collection.name}`}
        noScroll
        instant
        open={showModal}
        onClose={toggleModal}
        primaryAction={{
          content: 'Add collectible',
          onAction: handleCreateCollectible,
          loading: isDeploying,
          disabled: isDeploying,
        }}
      >
        <Modal.Section>
          <Columns columns={['oneThird', 'twoThirds']} gap="5">
            <DropZone onDrop={handleDropZoneDrop}>
              {image ? (
                <Thumbnail
                  size="large"
                  alt={name}
                  source={window.URL.createObjectURL(image)}
                />
              ) : (
                <DropZone.FileUpload />
              )}
            </DropZone>
            <AlphaStack gap="5">
              <TextField
                type="text"
                label="Name"
                disabled={isDeploying}
                value={name}
                requiredIndicator
                onChange={setName}
              />
              <TextField
                type="text"
                label="Description"
                disabled={isDeploying}
                value={description}
                onChange={setDescription}
              />
            </AlphaStack>
          </Columns>
        </Modal.Section>
      </Modal>
      <Layout.Section>
        <LegacyCard>
          <IndexTable
            resourceName={{
              plural: 'collectibles',
              singular: 'collectible',
            }}
            headings={[
              { title: 'Image' },
              { title: 'Name' },
              { title: 'Description' },
            ]}
            itemCount={collectibles.length}
            selectable={false}
            emptyState={
              <EmptySearchResult
                title={'No collectibles found'}
                description={'Get started by creating a collectible'}
                withIllustration
              />
            }
          >
            {collectibles.map(
              ({ metadata: { id, name, description, image } }) => (
                <IndexTable.Row key={id}>
                  <IndexTable.Cell>
                    <Thumbnail source={image} alt={name} size="medium" />
                  </IndexTable.Cell>
                  <IndexTable.Cell>{name}</IndexTable.Cell>
                  <IndexTable.Cell>{description}</IndexTable.Cell>
                </IndexTable.Row>
              )
            )}
          </IndexTable>
        </LegacyCard>
      </Layout.Section>
    </ThirdwebLayout>
  );
}
