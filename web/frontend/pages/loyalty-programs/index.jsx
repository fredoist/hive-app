import { Page } from '@shopify/polaris';
import { useNavigate } from '@shopify/app-bridge-react';

export default function LoyaltyProgramsPage() {
  const navigate = useNavigate();

  return (
    <Page
      compactTitle
      title="Loyalty Programs"
      subtitle="Reward your customers at different stages of their journey, from
              initial free “drops” to claiming rewards at checkout."
      primaryAction={{
        content: 'Create campaign',
        onAction: () => navigate('/loyalty-programs/create'),
      }}
    ></Page>
  );
}
