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
import {useAuthenticatedFetch} from '../../hooks/useAuthenticatedFetch'
import useCollections from '../../hooks/useCollections'

export default function LoyaltyProgramsPage() {
  const [campaignType, setCampaignType] = useState('discount')
  const [discount, setDiscount] = useState(20)
  const {collections, isLoading, error} = useCollections({refetch: false})
  const [selected, setSelected] = useState()
  const fetch = useAuthenticatedFetch()

  const handleCampaignTypeChange = useCallback((_, value) => setCampaignType(value), [])
  const handleSelectChange = useCallback(sel => setSelected(sel), [])

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault()
      const collection = collections.find(({address}) => address === selected)
      try {
        const req = await fetch('/api/discounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collection: collection,
            discount
          })
        })
        if (!req.ok) return alert('Something went wrong. Please try again later.')
        // const { code } = await req.json()
        alert(`Created new discount code`)
      } catch (error) {
        console.error(error)
      }
    },
    [selected, discount, fetch]
  )

  return (
    <ThirdwebLayout
      error={error}
      loading={isLoading}
      title="Create a campaign"
      subtitle="Offer discounts for collectible holders"
    >
      <Layout.Section>
        <AlphaCard>
          <FormLayout>
            <Text variant="headingSm">Campaign Type</Text>
            <FormLayout.Group>
              <RadioButton
                label="Purchase discount"
                helpText="Allow customers to get a discount if they own a collectible."
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
            <Button primary onClick={handleSubmit}>
              Add discounts
            </Button>
          </FormLayout>
        </AlphaCard>
      </Layout.Section>
    </ThirdwebLayout>
  )
}
