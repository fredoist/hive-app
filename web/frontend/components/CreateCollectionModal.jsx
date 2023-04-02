import {
  Modal,
  TextField,
  AlphaStack,
  DropZone,
  Columns,
  FormLayout,
  Thumbnail
} from '@shopify/polaris'
import { lengthMoreThan, notEmpty, useField, useForm } from '@shopify/react-form'
import { useState } from 'react'
import { useCallback } from 'react'
import { useAddress, useSDK } from '@thirdweb-dev/react';

export default function m({ open, toggleModal }) {
  const address = useAddress()
  const sdk = useSDK()
  const [image, setImage] = useState(null)
  const { fields, dirty, reset, submit, submitting } = useForm({
    fields: {
      name: useField({
        value: '',
        validates: [
          notEmpty('Name is required'),
          lengthMoreThan(2, 'Name must be at least 3 characters')
        ]
      }),
      description: useField({
        value: '',
        validates: [
          notEmpty('Description is required'),
          lengthMoreThan(9, 'Description must be at least 10 characters')
        ]
      })
    },
    async onSubmit({ name, description }) {
      const collectionAddress = await createCollection({ image, name, description })
      if (!collectionAddress) {
        return { status: 'fail', errors: ['Failed to create collection'] }
      }
      reset()
      return { status: 'success', then: () => toggleModal(false) }
    }
  })

  const createCollection = useCallback(async ({ image, name, description }) => {
    try {
      const collectionAddress = await sdk.deployer.deployNFTCollection({
        name,
        description,
        image,
        symbol: name.slice(0, 3).toUpperCase(),
        primary_sale_recipient: address,
      })
      return collectionAddress
    } catch (error) {
      console.error(error)
      return null
    }
  }, [address, sdk])

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setImage(acceptedFiles[0]),
    []
  )

  return (
    <Modal
      title="Create a collection"
      noScroll
      instant
      open={open}
      onClose={() => toggleModal(false)}
      primaryAction={{
        content: 'Create',
        loading: submitting,
        disabled: !dirty,
        onAction: submit
      }}
    >
      <Modal.Section>
        <Columns columns={['oneThird', 'twoThirds']} gap="10" alignItems="center">
          <DropZone
            onDrop={handleDropZoneDrop}
            accept="image/*"
            type="image"
            errorOverlayText="File must be an image"
          >
            {image ? (
              <AlphaStack>
                <Thumbnail source={window.URL.createObjectURL(image)} alt={image.name} size="" />
              </AlphaStack>
            ) : (
              <DropZone.FileUpload actionTitle="Select Image" />
            )}
          </DropZone>
          <FormLayout>
            <TextField type="text" label="Name" requiredIndicator {...fields.name} />
            <TextField type="text" label="Description" requiredIndicator {...fields.description} />
          </FormLayout>
        </Columns>
      </Modal.Section>
    </Modal>
  )
}
