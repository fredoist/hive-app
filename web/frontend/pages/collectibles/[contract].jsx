import {
  AlphaCard,
  AlphaStack,
  Columns,
  DropZone,
  EmptySearchResult,
  EmptyState,
  IndexTable,
  Layout,
  Modal,
  Page,
  TextField,
  Thumbnail
} from '@shopify/polaris'
import { ConnectWallet, useAddress } from '@thirdweb-dev/react'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import useCollectibles from '../../hooks/useCollectibles'
import { walletImage } from '../../assets'

export default function ContractPage() {
  const { contract } = useParams()
  const address = useAddress()
  const { isDeploying, addCollectible, isLoading, collection, collectibles } =
    useCollectibles(contract)
  const [showModal, toggleModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setImage(acceptedFiles[0]),
    []
  )

  if (isLoading) return null

  return (
    <Page
      title={`${collection?.name}`}
      subtitle={collection?.description}
      primaryAction={{
        content: 'Add collectible',
        onAction: toggleModal,
        disabled: !address,
        helpText: !address && 'Connect your wallet to add a collectible'
      }}
      backAction={{
        content: 'Back to collections',
        onAction: () => window.history.back()
      }}
    >
      {address ? (
        <Layout>
          <Modal
            title={`Add collectible to ${collection?.name}`}
            noScroll
            instant
            open={showModal}
            onClose={toggleModal}
            primaryAction={{
              content: 'Add collectible',
              onAction: async () => {
                await addCollectible({
                  name,
                  description,
                  image
                })
                toggleModal()
              },
              loading: isDeploying,
              disabled: isDeploying
            }}
          >
            <Modal.Section>
              <Columns columns={['oneThird', 'twoThirds']} gap="5">
                <DropZone onDrop={handleDropZoneDrop}>
                  {image ? (
                    <Thumbnail size="large" alt={name} source={window.URL.createObjectURL(image)} />
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
            <AlphaCard padding="0">
              <IndexTable
                resourceName={{
                  plural: 'collectibles',
                  singular: 'collectible'
                }}
                headings={[{ title: 'Image' }, { title: 'Name' }, { title: 'Description' }]}
                itemCount={collectibles.length}
                loading={isLoading}
                selectable={false}
                emptyState={
                  <EmptySearchResult
                    title={'No collectibles found'}
                    description={'Get started by creating a collectible'}
                    withIllustration
                  />
                }
              >
                {collectibles?.map(({ metadata: { id, name, description, image } }) => (
                  <IndexTable.Row key={id}>
                    <IndexTable.Cell>
                      <Thumbnail source={image} alt={name} size="medium" />
                    </IndexTable.Cell>
                    <IndexTable.Cell>{name}</IndexTable.Cell>
                    <IndexTable.Cell>{description}</IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            </AlphaCard>
          </Layout.Section>
        </Layout>
      ) : (
        <EmptyState heading="Connect your wallet" image={walletImage}>
          <p style={{ marginBottom: '3rem' }}>You need to connect a digital wallet to continue.</p>
          <ConnectWallet theme="light" btnTitle="Connect wallet" />
        </EmptyState>
      )}
    </Page>
  )
}
