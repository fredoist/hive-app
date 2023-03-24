import {
  Layout,
  IndexTable,
  EmptySearchResult,
  Modal,
  TextField,
  AlphaStack,
  Button,
  AlphaCard
} from '@shopify/polaris'
import {useAddress} from '@thirdweb-dev/react'
import {useState} from 'react'
import {useNavigate} from '@shopify/app-bridge-react'

import ThirdwebLayout from '../../components/layouts/ThirdwebLayout'
import useCollections from '../../hooks/useCollections'
import useDeploy from '../../hooks/useDeploy'
import useModal from '../../hooks/useModal'

export default function CollectiblesPage() {
  const address = useAddress()
  const navigate = useNavigate()
  const [refetch, setRefetch] = useState(false)
  const {isLoading: isDeploying, deployCollection} = useDeploy()
  const {collections, isLoading, error} = useCollections({refetch})
  const [collection, setCollection] = useState({name: '', description: ''})
  const {showModal, toggleModal} = useModal()

  return (
    <ThirdwebLayout
      error={error}
      loading={isLoading}
      title="Collectibles"
      subtitle="Reward your customers and collab with other brands by offering
    unique collectibles to your customers."
      primaryAction={{
        content: 'Create collection',
        disabled: !address,
        onAction: toggleModal,
        helpText: !address && 'You need to connect a digital wallet to create your collectibles'
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
          loading: isDeploying,
          disabled: isDeploying,
          onAction: async () => {
            await deployCollection(collection)
            toggleModal()
            setRefetch(!refetch)
          }
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
              onChange={value => setCollection({...collection, name: value})}
            />
            <TextField
              type="text"
              label="Description"
              disabled={isDeploying}
              value={collection.description}
              onChange={value => setCollection({...collection, description: value})}
            />
          </AlphaStack>
        </Modal.Section>
      </Modal>
      <Layout.Section>
        <AlphaCard padding="0">
          <IndexTable
            resourceName={{
              plural: 'collections',
              singular: 'collection'
            }}
            headings={[{title: 'Name'}, {title: 'Description'}, {title: 'Symbol'}]}
            itemCount={collections.length}
            selectable={false}
            loading={isLoading}
            emptyState={
              <EmptySearchResult
                title={'No collections found'}
                description={'Get started by creating a collection'}
                withIllustration
              />
            }
          >
            {collections.map(({address, name, description, symbol}) => (
              <IndexTable.Row key={address}>
                <IndexTable.Cell>
                  <Button plain size="slim" onClick={() => navigate(`/collectibles/${address}`)}>
                    {name}
                  </Button>
                </IndexTable.Cell>
                <IndexTable.Cell>{description}</IndexTable.Cell>
                <IndexTable.Cell>{symbol}</IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </AlphaCard>
      </Layout.Section>
    </ThirdwebLayout>
  )
}
