import ReactDOM from 'react-dom';
import React from 'react';
import { App } from './App';

// The element ID is defined in app-block.liquid
const container = document.getElementById('tokengate-hive-app');
ReactDOM.createRoot(container).render(<App />);
