import {
  EmptySearchResult,
  Frame,
  Image,
  IndexTable,
  Layout,
  LegacyCard,
  Loading,
  Page,
  SkeletonPage,
} from '@shopify/polaris';
import { useContract, useMetadata, useNFTs } from '@thirdweb-dev/react';
import { useParams } from 'react-router-dom';

export default function ContractPage() {
  const { contract: contractId } = useParams();
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

  if (isLoadingCollection || isLoadingCollectibles)
    return (
      <Frame>
        <Loading />
        <SkeletonPage />
      </Frame>
    );
  if (collectionError || collectiblesError) {
    return (
      <Page title="Error">
        <p>There was an error loading this page.</p>
      </Page>
    );
  }
  return (
    <Page
      title={`${collection.name}`}
      subtitle={collection.description}
      primaryAction={{ content: 'Add collectible' }}
    >
      <Layout>
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
                      <Image src={image} alt={name} />
                    </IndexTable.Cell>
                    <IndexTable.Cell>{name}</IndexTable.Cell>
                    <IndexTable.Cell>{description}</IndexTable.Cell>
                  </IndexTable.Row>
                )
              )}
            </IndexTable>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
