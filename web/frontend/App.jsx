import { BrowserRouter } from 'react-router-dom'
import Routes from './Routes'

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components'
import { ThirdwebProvider } from '@thirdweb-dev/react'
import { NavigationMenu } from '@shopify/app-bridge-react'

export default function App() {
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)')

  return (
    <ThirdwebProvider activeChain="mumbai">
      <PolarisProvider>
        <BrowserRouter>
          <AppBridgeProvider>
            <QueryProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: 'Collectibles',
                    url: '/collectibles'
                  },
                  // {
                  //   label: 'Loyalty Programs',
                  //   url: '/loyalty-programs'
                  // },
                  // {
                  //   label: 'Reward Coins',
                  //   url: '/reward-coins'
                  // },
                  {
                    label: 'Gated Content',
                    url: '/gated-content'
                  }
                ]}
              />
              <Routes pages={pages} />
            </QueryProvider>
          </AppBridgeProvider>
        </BrowserRouter>
      </PolarisProvider>
    </ThirdwebProvider>
  )
}
