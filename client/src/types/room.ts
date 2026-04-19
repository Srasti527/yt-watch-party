export type ParticipantRole = 'host' | 'participant';

export interface Participant {
  id: string;
  username: string;
  role: ParticipantRole;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  participants: Participant[];
}
