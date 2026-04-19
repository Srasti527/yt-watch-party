YouTube Watch Party System

Overview

This project is a real-time YouTube Watch Party application where multiple users can watch videos together in sync. Actions like play, pause, seek, and video change are synchronized across all participants.

Features

Core Features

Real-time synchronization (play, pause, seek, video change)
Room-based system (create/join via room ID)
YouTube IFrame API integration
WebSocket communication using Socket.IO

Role-Based Access Control

Host (full control)
Moderator (play, pause, seek, change video)
Participant (view only)

Host Capabilities

Assign roles to participants
Remove participants
Transfer host to another user

Additional Features

Sync button to re-align playback
Leave room functionality

Tech Stack

Frontend: React + TypeScript + Vite
Backend: Node.js + Express
Real-time: Socket.IO
Video: YouTube IFrame API

How It Works

Users join a room using a room ID
Host or moderator controls playback
Server maintains room state
Events are broadcast using WebSockets
All clients stay synchronized

Setup Instructions

Backend

cd server
npm install
npm start

Frontend

cd client
npm install
npm run dev


Architecture

Backend manages rooms and participants
WebSockets handle real-time updates
Role-based permissions enforced on server
YouTube IFrame API controls video playback