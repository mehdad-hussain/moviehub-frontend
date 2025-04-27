# MovieHub Application

A modern movie catalog application built with Next.js for the frontend and a REST API backend.

## Table of Contents

- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)

## Frontend Setup

The frontend is built with Next.js and uses Tailwind CSS with ShadcnUI components for styling.

### Prerequisites

- Node.js 18.x or higher
- npm or yarn or bun package manager

### Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/mehdad-hussain/moviehub-frontend.git
cd moviehub-frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

3. Create a `.env` file in the root directory with the required environment variables (see [Environment Variables](#environment-variables) section).

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
# or
bun run build
bun run start
```

### Frontend Environment Variables

Create a `.env` file in the root of the frontend project with the following variables:

```
# API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:4000


# Node environment
NODE_ENV=development
```

## Authentication Flow

The application uses JWT token-based authentication with the following flow:

1. **User Login/Registration**:

   - When a user logs in or registers, the backend responds with an access token and a refresh token.
   - The access token is stored in memory (through Zustand store).
   - The refresh token is stored as an HTTP-only cookie.

2. **Token Usage**:

   - The access token is sent in the `Authorization` header with each API request.
   - When the access token expires, the frontend automatically attempts to refresh it.

3. **Token Refresh**:

   - When an API request returns a 401 Unauthorized status, the frontend tries to refresh the token.
   - A request is sent to `/auth/refresh-token` with the refresh token cookie.
   - If successful, a new access token is received and stored.

4. **Logout**:
   - When the user logs out, both tokens are invalidated on the server.
   - The cookies are cleared, and the store is reset.
