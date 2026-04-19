export type ParticipantRole = 'host' | 'moderator' | 'participant';

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
  lastPlayTimestamp?: number | null;
  participants: Participant[];
}
