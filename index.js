import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';   // your existing global styles
import './styles/Auth.css';    // new styles for login/register pages

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
