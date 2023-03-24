import { useAddress, useSDK } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';

export default function useCollections({ refetch }) {
  const address = useAddress();
  const sdk = useSDK();
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    async function getContracts() {
      try {
        setIsLoading(true);
        const contracts = await sdk.getContractList(address);
        if (!contracts.length) {
          setIsLoading(false);
          return;
        }
        const collections = contracts.map(async (contract) => {
          const { name, description, symbol } = await contract.metadata();
          return {
            address: contract.address,
            name,
            description,
            symbol,
          };
        });
        const data = await Promise.all(collections);
        setIsLoading(false);
        setCollections(data);
      } catch (error) {
        setIsLoading(false);
        setError(error);
      }
    }
    getContracts();
  }, [address, sdk, refetch]);

  return { collections, isLoading, error };
}
