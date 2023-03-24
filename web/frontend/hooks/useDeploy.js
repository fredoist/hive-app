import { useAddress, useSDK } from '@thirdweb-dev/react';
import { useCallback, useState } from 'react';

export default function useDeploy() {
  const address = useAddress();
  const sdk = useSDK();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deployCollection = useCallback(async ({ name, description }) => {
    if (!address) return;
    if (!name || !description) return;
    try {
      setIsLoading(true);
      await sdk.deployer.deployNFTCollection({
        name: name,
        description: description,
        symbol: name.slice(0, 3).toUpperCase(),
        primary_sale_recipient: address,
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error);
      console.error('Error deploying collection', error)
    }
  }, [address]);

  return { deployCollection, isLoading, error }
}
