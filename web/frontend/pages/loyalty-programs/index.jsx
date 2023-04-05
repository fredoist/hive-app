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
      value: '',
      validates: (name) => !name && 'Name cannot be empty'
    }),
    address: useField({
      value: '',
      validates: (address) => !address && 'Contract cannot be empty'
    }),
    products: useField([])
  }

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { name, products, address } = formData

      const productGid = products[0].id

      const response = await fetch('/api/airdrops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          productGid,
          address
        })
      })

      if (response.ok) {
        setToastProps({ content: 'Tokengate created' })
        makeClean()
        navigate('/loyalty-programs')
      } else {
        setToastProps({
          content: 'There was an error creating the airdrop',
          error: true
        })
      }
    }
  })

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  )

  return (
    <Page
      narrowWidth
      title="Create a new Airdrop"
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
                  <LegacyCard.Section title="Contract">
                    <TextField
                      name="address"
                      helpText="Contract address for the token you want to airdrop."
                      type="text"
                      placeholder="0x1234567890123456789012345678901234567890"
                      {...fields.address}
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
