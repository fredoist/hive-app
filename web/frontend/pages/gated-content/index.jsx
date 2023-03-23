import { Page } from '@shopify/polaris';

export default function GatedContentPage() {
  return (
    <Page
      compactTitle
      title="Gated Content"
      subtitle="Give collectible holders exclusive access to products, discounts,
              and more when they connect their wallet to your store."
      primaryAction={{
        content: 'Create gate',
        onAction: () => alert('Create collectible'),
      }}
    ></Page>
  );
}
