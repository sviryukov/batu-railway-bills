import { createRoot } from 'react-dom/client';
import { App } from './App';
import React from 'react';

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
