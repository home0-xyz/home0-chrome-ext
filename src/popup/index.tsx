import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../sidebar/App';
import { AuthProvider } from '../sidebar/contexts/AuthContext';
import '../sidebar/index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);