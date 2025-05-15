# Placies

A location-based service application built with Node.js, Express, TypeScript, MySQL.

## Features

- Location-based search with geospatial queries
- User favorites management
- RESTful API with OpenAPI documentation

## TODO
- [ ] fine-grain caching: unique cache key generated from search query
- [ ] logs service
- [ ] rate limit

## Technologies used
- [drizzle-orm](https://orm.drizzle.team/)
- [zod](https://zod.dev/)

## Prerequisites

- Node 22
- pnpm
- MySQL
- Redis

## Installation and Setup

### Using Docker compose

1. Start the application:
   ```sh
   docker compose up -d
   ```

The application will be available at http://localhost:8080

Note: The application will automatically:
- Wait for the database to be ready
- Run database migrations
- Seed the database with initial data
- Start the application

### Manual Setup

1. Install dependencies:
   ```sh
   pnpm install
   ```

2. Set up MySQL & Redis:
   Either use the services defined in `docker-compose.yml`, or setup your own instances

3. Environment Variables
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=mysql://placies:placies@localhost:3306/placies
   REDIS_URL=redis://localhost:6379
   ```

4. Run database migrations:
   ```sh
   pnpm drizzle-kit push:mysql
   ```

5. (Optional) Seed the database:
   ```sh
   pnpm seed
   ```

6. Start the development server:
   ```sh
   pnpm dev
   ```

For production:
```sh
pnpm build
pnpm start
```

## API Documentation

Once the application is running, you can access the OpenAPI documentation at:
http://localhost:8080/api-docs

## Development

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the application
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm seed` - Seed the database with sample data

### Database Migrations

Generate migrations:
```sh
pnpm drizzle-kit generate --name=<YOUR_CHANGES>
```

Apply migrations:
```sh
pnpm drizzle-kit migrate
```

## Project Structure

```
src/
├── app.ts              # Application entry point
├── configs/            # Configuration files
├── db/                 # Database setup and schema
├── error/             # Error handling
└── modules/           # Feature modules
    ├── locations/     # Location-related features
    ├── users/         # User management
    └── favorites/     # User favorites
```

