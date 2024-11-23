import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import "./index.css"
const root = createRoot(document.getElementById('root'));

root.render(
<Auth0Provider
    domain="chatapp-react.us.auth0.com"
    clientId="ZuT3F1o4fWkmuBeQjq1ntJC7Cm7Nl6Ff"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
);
