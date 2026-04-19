import { Route, Routes } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

export default function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </SocketProvider>
  );
}
