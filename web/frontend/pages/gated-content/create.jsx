import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  Form,
  Layout,
  Page,
  PageActions,
  LegacyCard,
  LegacyStack,
  AlphaStack,
  TextField,
  Text
} from '@shopify/polaris'
import { ContextualSaveBar, Toast } from '@shopify/app-bridge-react'
import { useField, useForm } from '@shopify/react-form'
import { useAuthenticatedFetch } from '../../hooks'
import { TokengatesResourcePicker } from '../../components/TokengatesResourcePicker'

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch()
  const navigate = useNavigate()
  const [toastProps, setToastProps] = useState({ content: null })

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && 'Name cannot be empty'
    }),
    discountType: useField('percentage'),
    discount: useField({
      value: undefined,
      validates: (discount) => !discount && 'Discount cannot be empty'
    }),
    segment: useField({
      value: undefined,
      validates: (segment) => !segment && 'Segment cannot be empty'
    }),
    products: useField([])
  }

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { discountType, discount, name, products, segment } = formData

      const productGids = products.map((product) => product.id)

      const response = await fetch('/api/gates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discountType,
          discount,
          name,
          productGids,
          segment: segment.split(',')
        })
      })

      if (response.ok) {
        setToastProps({ content: 'Tokengate created' })
        makeClean()
        navigate('/gated-content')
      } else {
        setToastProps({
          content: 'There was an error creating a tokengate',
          error: true
        })
      }
    }
  })

  const handleDiscountTypeButtonClick = useCallback(() => {
    if (fields.discountType.value === 'percentage') {
      fields.discountType.onChange('amount')
    } else {
      fields.discountType.onChange('percentage')
    }
  }, [fields.discountType])

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  )

  return (
    <Page
      narrowWidth
      backAction={{
        content: 'Back to Tokengates',
        onAction: () => navigate('/gated-content')
      }}
      title="Create a new Tokengate"
    >
      <Layout>
        <Layout.Section>
          <Form onSubmit={submit}>
            <ContextualSaveBar
              saveAction={{
                onAction: submit,
                disabled: submitting || !dirty,
                loading: submitting
              }}
              discardAction={{
                onAction: reset
              }}
              visible={dirty}
            />
            {toastMarkup}
            <Layout>
              <Layout.Section>
                <LegacyCard>
                  <LegacyCard.Section>
                    <AlphaStack gap="2">
                      <Text variant='headingMd'>Configuration</Text>
                      <TextField
                        name="name"
                        label="Name"
                        type="text"
                        {...fields.name}
                        autoComplete="off"
                      />
                    </AlphaStack>
                  </LegacyCard.Section>
                  <LegacyCard.Section title="DISCOUNT PERK">
                    <LegacyStack>
                      <LegacyStack.Item>
                        <ButtonGroup segmented>
                          <Button
                            pressed={fields.discountType.value === 'percentage'}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Percentage
                          </Button>
                          <Button
                            pressed={fields.discountType.value === 'amount'}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Fixed Amount
                          </Button>
                        </ButtonGroup>
                      </LegacyStack.Item>
                      <LegacyStack.Item fill>
                        <TextField
                          name="discount"
                          type="number"
                          {...fields.discount}
                          autoComplete="off"
                          suffix={fields.discountType.value === 'percentage' ? '%' : ''}
                          fullWidth
                        />
                      </LegacyStack.Item>
                    </LegacyStack>
                  </LegacyCard.Section>
                  <LegacyCard.Section title="SEGMENT">
                    <TextField
                      name="segment"
                      helpText="Comma separated list of collection addresses"
                      type="text"
                      placeholder="0x123, 0x456, 0x789"
                      {...fields.segment}
                      autoComplete="off"
                    />
                  </LegacyCard.Section>
                </LegacyCard>
              </Layout.Section>
              <Layout.Section>
                <TokengatesResourcePicker products={fields.products} />
              </Layout.Section>
              <Layout.Section>
                <PageActions
                  primaryAction={{
                    content: 'Save',
                    disabled: submitting || !dirty,
                    loading: submitting,
                    onAction: submit
                  }}
                />
              </Layout.Section>
            </Layout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
