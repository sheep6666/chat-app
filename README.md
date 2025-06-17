# ChatApp - Real-Time Web Chat Application
A lightweight web-based chat application that supports user registration, login, one-on-one conversations, real-time messaging, and online user status indication.

## Project Structure
- **`api-server`**  
  Provides RESTful APIs to interact with the database, including user registration, authentication, message handling, and conversation management.

- **`ws-server`**  
  Handles WebSocket connections for real-time communication. Broadcasts user online/offline status and messages. Utilizes Redis to store user presence.

- **`web-client`**  
  A single-page application built with React.js.


## Core Technologies
| Layer         | Technologies |
|---------------|--------------|
| Frontend      | React.js, Redux Toolkit (RTK) |
| API / WS      | Express.js, MongoDB, Socket.IO, Redis |
| Deployment    | Docker, Nginx, GitHub Actions |
| Tooling       | Swagger (API Docs), Winston (Logging), Morgan (HTTP Logger), Jest (Testing) |


## Getting Started
### Development & Testing
1. **Setup environment variables**  
   Copy `.env.example` from each service to `.env` and configure the necessary values.

2. **Start services locally**
    ```bash
    npm run dev
    ```

### CI/CD Deployment (via GitHub Actions)
The deployment pipeline includes:
- Connect to a cloud virtual machine (e.g. EC2)
- Pull the latest source code from the GitHub repository
- Inject secrets and environment variables into .env files via GitHub Secrets
- Build and start all required services using Docker Compose
