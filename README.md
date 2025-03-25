# Zero to Hundred

A memecoin platform that allows users to create, buy, and sell memecoins.

https://zero-to-hundred-frontend.onrender.com

https://zero-to-hundred-backend.onrender.com

## Project Structure

```
zero-to-hundred/
├── backend/         # NestJS backend
├── frontend/        # Vue.js frontend
├── doc/             # Documentation
├── docker/          # Docker configurations
├── nginx/           # Nginx configurations
├── .github/         # GitHub Actions workflows
└── docker-compose.yml
```

## Prerequisites

- Node.js (latest LTS version)
- Docker and Docker Compose
- PostgreSQL (for local development)
- Git

## Getting Started

### Development

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/zero-to-hundred.git
   cd zero-to-hundred
   ```

2. Start the development environment:

   ```bash
   docker-compose -f docker/docker-compose.dev.yml up
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - Swagger API Documentation: http://localhost:3000/api

### Production

1. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env file with your production values
   ```

2. Start the production environment:
   ```bash
   docker-compose -f docker/docker-compose.prod.yml up -d
   ```

## Documentation

For more detailed documentation, please refer to the [doc](./doc) directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
