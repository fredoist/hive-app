import { useAddress, useContract, useMetadata, useMintNFT, useNFTs } from '@thirdweb-dev/react'
import { useCallback } from 'react'

export default function useCollectibles(contractId) {
  const address = useAddress()
  const { contract } = useContract(contractId)
  const { mutateAsync: mintNFT, isLoading: isDeploying, error: deployError } = useMintNFT(contract)
  const {
    data: collection,
    isLoading: isLoadingCollection,
    error: collectionError
  } = useMetadata(contract)
  const {
    data: collectibles,
    isLoading: isLoadingCollectibles,
    error: collectiblesError
  } = useNFTs(contract)

  const addCollectible = useCallback(
    async ({ name, description, image }) => {
      if (!address) return
      if (!name || !description || !image) return
      try {
        await mintNFT({
          metadata: {
            name,
            description,
            image
          },
          to: address
        })
      } catch (error) {
        console.error('An error ocurred while deploying a collectible', error)
      }
    },
    [address]
  )

  return {
    isDeploying,
    addCollectible,
    collection,
    collectibles,
    isLoading: isLoadingCollection || isLoadingCollectibles,
    error: collectionError || collectiblesError || deployError
  }
}
