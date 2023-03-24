import {
  AlphaCard,
  Button,
  Form,
  FormLayout,
  Layout,
  RadioButton,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { useAddress, useSDK } from '@thirdweb-dev/react';

export default function LoyaltyProgramsPage() {
  const [campaignType, setCampaignType] = useState('discount');
  const [discount, setDiscount] = useState(0);
  const address = useAddress();
  const sdk = useSDK();
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState();

  useEffect(() => {
    if (!address) return;
    async function getContracts() {
      const contracts = await sdk.getContractList(address);
      if (!contracts.length) {
        return;
      }
      const collections = contracts.map(async (contract) => {
        const { name } = await contract.metadata();
        return {
          label: name,
          value: contract.address,
        };
      });
      Promise.all(collections).then((result) => {
        setContracts(result);
      });
    }
    getContracts();
  }, [address]);

  const handleCampaignTypeChange = useCallback(
    (_, value) => setCampaignType(value),
    []
  );
  const handleSelectChange = useCallback((sel) => setSelected(sel), []);

  const handleSubmit = useCallback(() => {
    //
  }, []);

  return (
    <ThirdwebLayout
      title="Create a campaign"
      subtitle="Offer discounts for collectible holders"
    >
      <Layout.Section>
        <AlphaCard>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <Text variant="headingSm">Campaign Type</Text>
              <FormLayout.Group>
                <RadioButton
                  label="Purchase discount"
                  helpText="Allow customers to get a discount if they own a collectible"
                  checked={campaignType === 'discount'}
                  id="discount"
                  name="campaignType"
                  onChange={handleCampaignTypeChange}
                />
              </FormLayout.Group>
              <FormLayout.Group>
                <Select
                  label="Apply to collection"
                  value={selected}
                  options={contracts}
                  onChange={handleSelectChange}
                />
                <TextField
                  type="number"
                  label="Discount percentage"
                  value={discount}
                  onChange={setDiscount}
                />
              </FormLayout.Group>
              <Button primary submit>
                Add discounts
              </Button>
            </FormLayout>
          </Form>
        </AlphaCard>
      </Layout.Section>
    </ThirdwebLayout>
  );
}
