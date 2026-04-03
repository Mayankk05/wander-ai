# Wander AI

## Overview
Wander AI is a project that consists of the following components:
- **wanderai-backend**: The backend API for the application.
- **wanderai-frontend**: The frontend user interface.

## Setup Steps
### wanderai-backend
1. Clone the repository: `git clone https://github.com/Mayankk05/wander-AI.git`
2. Navigate to the `wanderai-backend` directory: `cd wander-AI/wanderai-backend`
3. Install dependencies: `npm install`
4. Create a `.env` file from the `.env.example`: `cp .env.example .env`
5. Update the `.env` file with the necessary environment variables, including:
   - `GOOGLE_MAPS_API_KEY`  
   - `DATABASE_URL`
6. Run the application: `npm start`

### wanderai-frontend
1. Navigate to the `wanderai-frontend` directory: `cd wander-AI/wanderai-frontend`
2. Install dependencies: `npm install`
3. Run the application: `npm start`

## Environment Variables
| Variable                  | Description                           |
|---------------------------|---------------------------------------|
| GOOGLE_MAPS_API_KEY      | Your Google Maps API key              |
| DATABASE_URL              | Your database connection URL          |
| OTHER_ENV_VAR             | Description of other environment var  |

## API Overview
The backend provides RESTful APIs to interact with the frontend. It includes endpoints for user registration, authentication, and data retrieval.

### Socket.io Events
- `connection`: Fired upon connecting to the Socket.io server.
- `disconnection`: Fired when the client disconnects from the Socket.io server.

## License
This project is licensed under the MIT License.