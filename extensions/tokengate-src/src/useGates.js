import { useState, useEffect } from 'react';
import { host } from './useEvaluateGate';

export const useGates = () => {
  const [gates, setGates] = useState({ requirements: null, reaction: null });
  const productId = getProductId();
  useEffect(() => {
    async function fetchGates() {
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
      setGates({ requirements, reaction });
    }
    fetchGates();
  }, []);

  return gates;
};

function getShopDomain() {
  return window.Shopify.shop;
}

function getProductId() {
  return document.getElementById('tokengate-hive-app').dataset.product_id;
}
