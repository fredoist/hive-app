import { useState, useEffect } from 'react';

// Set this to the ngrok url that is generated when you run the server
export const host = 'https://379e-177-228-34-73.ngrok.io';
if (host == '') {
  console.error(`
    ************************************************************
    You must set the host to your ngrok url in useEvaluateGate.js.
    Run \`npm run dev\` and replace the YOUR_NGROK_URL with the url found in the terminal
    ************************************************************
  `);
}

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
