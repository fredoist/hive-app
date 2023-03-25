import {
  AlphaCard,
  Button,
  Form,
  FormLayout,
  Layout,
  RadioButton,
  Select,
  Text,
  TextField
} from '@shopify/polaris'
import {useCallback, useState} from 'react'
import ThirdwebLayout from '../../components/layouts/ThirdwebLayout'
import useCollections from '../../hooks/useCollections'

export default function LoyaltyProgramsPage() {
  const [campaignType, setCampaignType] = useState('discount')
  const [discount, setDiscount] = useState(20)
  const {collections, isLoading, error} = useCollections({refetch: false})
  const [selected, setSelected] = useState()

  const handleCampaignTypeChange = useCallback((_, value) => setCampaignType(value), [])
  const handleSelectChange = useCallback(sel => setSelected(sel), [])

  const handleSubmit = useCallback(() => {
    //
  }, [])

  return (
    <ThirdwebLayout
      error={error}
      loading={isLoading}
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
                  requiredIndicator
                  label="Apply to collection"
                  helpText="The discount will apply to owners of this collection"
                  value={selected}
                  options={collections.map(({name, address}) => ({
                    label: name,
                    value: address
                  }))}
                  onChange={handleSelectChange}
                />
                <TextField
                  requiredIndicator
                  type="number"
                  label="Discount percentage"
                  helpText="A number between 1 and 100"
                  value={discount}
                  onChange={setDiscount}
                  min={0}
                  max={100}
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
  )
}
