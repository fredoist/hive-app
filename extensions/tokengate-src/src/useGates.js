import { useState, useEffect } from 'react';
import { host } from './useEvaluateGate';

export const useGates = () => {
  const [requirements, setRequirements] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const productId = getProductId();
  useEffect(() => {
    async function fetchGates() {
      setLoading(true);
      const response = await fetch(`${host}/public/gates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productGid: `gid://shopify/Product/${productId}`,
          shopDomain: getShopDomain(),
        }),
      });
      const { requirements, reaction } = await response.json();
      setRequirements(requirements);
      setReaction(reaction);
      setLoading(false);
    }
    fetchGates();
  }, []);

  return { requirements, reaction, loading };
};

function getShopDomain() {
  return window.Shopify.shop;
}

function getProductId() {
  return document.getElementById('tokengate-hive-app').dataset.product_id;
}
