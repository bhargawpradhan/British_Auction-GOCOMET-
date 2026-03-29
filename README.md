# British Auction - GOCOMET

A premium, full-stack real-time British Auction and RFQ system.

## Project Structure

- `client/`: React-based frontend using Vite and Vanilla CSS.
- `server/`: Node.js backend using Express and Redis for real-time communication.

## Key Features

- **Live Bidding Terminal**: Dynamic, real-time bidding with glassmorphism UI.
- **AI Chat Integration**: Interactive auction assistant for user support.
- **Real-time Analytics**: Price charts and bid history tracking.
- **Secure Payments**: (Future) Razorpay integration for auction winners.

## Getting Started

### Prerequisites

- Node.js
- Redis

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables in `.env` files.
4. Start the development servers:
   ```bash
   cd client && npm run dev
   cd ../server && npm run dev
   ```
