import { createContext, useContext, type ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
import { socket } from '../socket';

const SocketContext = createContext<Socket>(socket);

export function SocketProvider({ children }: { children: ReactNode }) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket {
  return useContext(SocketContext);
}
