import { Page } from '@shopify/polaris';

export default function RewardCoinsPage() {
  return (
    <Page
      compactTitle
      title="Reward Coins"
      subtitle="Reward your customers with a digital currency that they can redeem
              for special offers and discounts."
      primaryAction={{
        content: 'Create coin',
        onAction: () => alert('Create collectible'),
      }}
    ></Page>
  );
}
