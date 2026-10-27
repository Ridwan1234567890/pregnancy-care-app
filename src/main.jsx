/**
 * FILE GUIDE: App entry point: finds the HTML root and renders the top-level React application.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './lib/firebaseClient.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
