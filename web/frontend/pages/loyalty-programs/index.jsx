import { Page } from '@shopify/polaris';

export default function LoyaltyProgramsPage() {
  return (
    <Page
      compactTitle
      title="Loyalty Programs"
      subtitle="Reward your customers at different stages of their journey, from
              initial free “drops” to claiming rewards at checkout."
      primaryAction={{
        content: 'Create campaign',
        onAction: () => alert('Create collectible'),
      }}
    ></Page>
  );
}
