import { useNavigate } from 'react-router-dom'
import ThirdwebLayout from '../../components/layouts/ThirdwebLayout'
import { AlphaCard, Layout } from '@shopify/polaris';

export default function GatedContentPage() {
  const navigate = useNavigate()

  return (
    <ThirdwebLayout
      title="Gated Content"
      subtitle="Give collectible holders exclusive access to products, discounts,
              and more when they connect their wallet to your store."
      primaryAction={{
        content: 'Create gate',
        onAction: () => navigate('/gated-content/create'),
      }}
    >
      <Layout.Section>
        <AlphaCard padding="5">
          <p>No gates found</p>
        </AlphaCard>
      </Layout.Section>
    </ThirdwebLayout>
  )
}
