import ThirdwebLayout from '../../components/layouts/ThirdwebLayout';

export default function GatedContentPage() {
  return (
    <ThirdwebLayout
      title="Gated Content"
      subtitle="Give collectible holders exclusive access to products, discounts,
              and more when they connect their wallet to your store."
      primaryAction={{
        content: 'Create gate',
        onAction: () => alert('Create collectible'),
      }}
    ></ThirdwebLayout>
  );
}
