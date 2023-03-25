import { BrowserRouter } from 'react-router-dom'
import { NavigationMenu } from '@shopify/app-bridge-react'
import Routes from './Routes'

import { AppBridgeProvider, QueryProvider, PolarisProvider } from './components'
import { ThirdwebProvider } from '@thirdweb-dev/react'

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
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
                    destination: '/collectibles'
                  },
                  {
                    label: 'Loyalty Programs',
                    destination: '/loyalty-programs'
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
