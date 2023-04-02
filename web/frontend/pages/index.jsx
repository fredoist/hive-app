import { useNavigate } from 'react-router-dom'
import { Layout, Page, CalloutCard, Text, Badge } from '@shopify/polaris'
import {
  collectiblesImage,
  gatedContentImage,
  loyaltyProgramImage,
  rewardCoinsImage
} from '../assets'

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <Page
      title="Get started"
      subtitle="Recognize your customers and reward them for their loyalty with unique collectibles, loyalty programs, and more."
    >
      <Layout>
        <Layout.Section oneHalf>
          <CalloutCard
            title="Collectibles"
            illustration={collectiblesImage}
            primaryAction={{
              content: 'Manage collectibles',
              onAction: () => navigate('/collectibles')
            }}
          >
            <p>
              Reward your customers and collab with other brands by offering unique collectibles to
              your customers.
            </p>
          </CalloutCard>
          <CalloutCard
            title={
              <Text variant="headingMd">
                Reward Coins <Badge>Work in progress</Badge>
              </Text>
            }
            illustration={rewardCoinsImage}
            primaryAction={{
              content: 'Manage reward coins',
              disabled: true,
              helpText: 'Coming soon'
            }}
          >
            <p>
              Reward your customers with a digital currency that they can redeem for special offers
              and discounts.
            </p>
          </CalloutCard>
        </Layout.Section>
        <Layout.Section oneHalf>
          <CalloutCard
            title="Gated Content"
            illustration={gatedContentImage}
            primaryAction={{
              content: 'Manage gated content',
              onAction: () => navigate('/gated-content')
            }}
          >
            <p>
              Give collectible holders exclusive access to products, discounts, and more when they
              connect their wallet to your store.
            </p>
          </CalloutCard>
          <CalloutCard
            title={
              <Text variant="headingMd">
                Loyalty Programs <Badge>Work in progress</Badge>
              </Text>
            }
            illustration={loyaltyProgramImage}
            primaryAction={{
              content: 'Manage loyalty programs',
              disabled: true
            }}
          >
            <p>
              Reward your customers at different stages of their journey, from initial free “drops”
              to claiming rewards at checkout.
            </p>
          </CalloutCard>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
