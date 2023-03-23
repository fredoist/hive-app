import { Frame, Loading, Page } from '@shopify/polaris';
import { useContract, useMetadata } from '@thirdweb-dev/react';
import { useParams } from 'react-router-dom';

export default function ContractPage() {
  const { contract: contractId } = useParams();
  const { contract } = useContract(contractId)
  const {data, isLoading, error} = useMetadata(contract)

  if (isLoading) return <Frame><Loading /></Frame>;
  if (error) return <Page title="Error"></Page>;
  return <Page title={`Contract for ${data.name}`}></Page>;
}
