import { Card, Image, Layout, Page, Stack } from '@shopify/polaris';

export default function CollectiblesPage() {
  return (
    <Page
      compactTitle
      title="Collectibles"
      subtitle="Reward your customers and collab with other brands by offering
              unique collectibles to your customers."
      primaryAction={{
        content: 'Create collectible',
        onAction: () => alert('Create collectible'),
      }}
    >
      <Layout>
        <Layout.Section>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
