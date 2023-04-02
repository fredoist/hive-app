import { ConnectWallet, useAddress } from '@thirdweb-dev/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layout,
  IndexTable,
  EmptySearchResult,
  Button,
  AlphaCard,
  Tag,
  Tooltip,
  Toast,
  Page,
  EmptyState
} from '@shopify/polaris'

import useCollections from '../../hooks/useCollections'
import CreateCollectionModal from '../../components/CreateCollectionModal'
import { openSeaIcon, walletImage } from '../../assets'

export default function CollectiblesPage() {
  const address = useAddress()
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [showModal, toggleModal] = useState(false)
  const { collections, isLoading, error } = useCollections({ showModal })

  return (
    <Page
      title="Collectibles"
      subtitle="Reward your customers and collab with other brands by offering
    unique collectibles to your customers."
      primaryAction={{
        content: 'Create collection',
        disabled: !address,
        onAction: () => toggleModal(true),
        helpText: !address && 'You need to connect a digital wallet to create your collectibles'
      }}
    >
      {address ? (
        <Layout>
          <CreateCollectionModal open={showModal} toggleModal={toggleModal} />
          {showToast ? (
            <Toast
              content="Copied contract address to clipboard"
              onDismiss={() => setShowToast(false)}
            />
          ) : null}
          <Layout.Section>
            <AlphaCard padding="0">
              <IndexTable
                resourceName={{
                  plural: 'collections',
                  singular: 'collection'
                }}
                headings={[
                  { title: 'Name' },
                  { title: 'Description' },
                  { title: 'Contract Address' },
                  { title: 'Symbol' },
                  { title: 'Links' }
                ]}
                itemCount={collections.length}
                selectable={false}
                loading={isLoading}
                emptyState={
                  !isLoading ? (
                    <EmptySearchResult
                      title={'No collections found'}
                      description={'Get started by creating a collection'}
                      withIllustration
                    />
                  ) : null
                }
              >
                {collections.map(({ address, name, description, symbol }) => (
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
                    <IndexTable.Cell>
                      <Tooltip content="Click to copy">
                        <Tag
                          accessibilityLabel="Contract Address"
                          onClick={async (e) => {
                            e.preventDefault()
                            await navigator.clipboard.writeText(address)
                            setShowToast(true)
                          }}
                        >
                          {address}
                        </Tag>
                      </Tooltip>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{symbol}</IndexTable.Cell>
                    <IndexTable.Cell>
                      <a
                        href={`https://testnets.opensea.io/assets/mumbai/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View on OpenSea"
                      >
                        <img src={openSeaIcon} width={24} alt="OpenSea Marketplace" />
                      </a>
                    </IndexTable.Cell>
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
