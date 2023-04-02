import { Tokengate } from '@shopify/tokengate';
import {
  ConnectButton,
  ConnectWalletProvider,
  useConnectWallet,
} from '@shopify/connect-wallet';
import { getDefaultConnectors } from '@shopify/connect-wallet';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useEvaluateGate } from './useEvaluateGate';
import { useGates } from './useGates';

const _App = () => {
  const { isLocked, unlockingTokens, evaluateGate } = useEvaluateGate();
  const { wallet } = useConnectWallet({
    onConnect: (wallet) => {
      evaluateGate(wallet);
    },
  });

  const { requirements, reaction, loading } = useGates();
  if(!requirements || !reaction) return null;

  return (
    <Tokengate
      isConnected={Boolean(wallet)}
      connectButton={<ConnectButton />}
      isLoading={loading}
      requirements={requirements}
      reaction={reaction}
      isLocked={isLocked}
      unlockingTokens={unlockingTokens}
    />
  );
};

export const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectWalletProvider
        chains={chains}
        connectors={connectors}
        wallet={undefined}
      >
        <_App />
      </ConnectWalletProvider>
    </WagmiConfig>
  );
};

const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultConnectors({
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors: connectors,
  provider,
  webSocketProvider,
});
