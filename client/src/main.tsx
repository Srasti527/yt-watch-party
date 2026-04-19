// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import './index.css';
// import App from './App.tsx';

// createRoot(document.getElementById('root')!).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { SocketProvider } from './context/SocketContext';

createRoot(document.getElementById('root')!).render(
  <SocketProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SocketProvider>
);