import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Kiosk from './pages/Kiosk.tsx';
import QueueDisplay from './pages/QueueDisplay.tsx';
import './index.css';

const path = window.location.pathname;

let Component = App;
if (path === '/kiosk') Component = Kiosk;
if (path === '/queue') Component = QueueDisplay;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Component />
  </StrictMode>,
);
