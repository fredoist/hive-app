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
import { useEffect, useState } from 'react';

const _App = () => {
  const { isLocked, unlockingTokens, evaluateGate } = useEvaluateGate();
  const [requirements, setRequirements] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { requirements, reaction } = getGate();
    setRequirements(requirements);
    setReaction(reaction);
    setLoading(false);
  }, [window.myAppGates]);

  const { wallet } = useConnectWallet({
    onConnect: (wallet) => {
      evaluateGate(wallet);
    },
  });

  return (
    <Tokengate
      isConnected={Boolean(wallet)}
      connectButton={<ConnectButton />}
      loading={loading}
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

const getGate = () => window.myAppGates?.[0] || {};

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
