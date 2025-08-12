# Lucky TODO Web App

A lightweight, fast, and fully-typed **ToDo List Web Application** built with **Vite**, **TypeScript**, and **VanJS**, consuming a backend REST API defined in **OpenAPI 3.0**.

## Features

- **VanJS** (`vanjs-core`) for declarative UI without heavy frameworks.
- **TypeScript** for strong typing and better DX.
- **Vite** for lightning-fast development and optimized builds.
- **Zod** validation for API responses.
- **Environment-based API URL** (sandbox/production switch).
- **Full CRUD** for tasks:
  - Create
  - List
  - Toggle complete/incomplete
  - Delete
- Filters & text search for tasks.
- **Optimistic UI** with rollback on error.
- Responsive design without CSS frameworks.
- Minimal state management via a simple store.
- Unit tests for store logic with **Vitest**.

## Tech Stack

| Component       | Choice         | Reason                                        |
|-----------------|----------------|-----------------------------------------------|
| Build Tool      | Vite           | Fast dev server, optimized builds             |
| Language        | TypeScript     | Type safety                                   |
| UI Library      | VanJS          | Tiny, declarative, no virtual DOM             |
| Validation      | Zod            | Runtime validation for API responses          |
| Testing         | Vitest         | Lightweight unit testing                      |
| API Spec        | OpenAPI 3.0    | Self-documented backend                       |

## Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/your-username/lucky-todo-web-app.git
cd lucky-todo-web-app/todo-frontend
````

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
VITE_API_BASE_URL=https://sandbox.api.todoapp.com/v1
```

> The OpenAPI spec is located at `./todo-openapi.yaml`. Update `VITE_API_BASE_URL` to switch environments (e.g., production).

### 4) Run locally

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173)

### 5) Build for production

```bash
npm run build
```

### 6) Preview production build

```bash
npm run preview
```

## Project Structure

```
todo-frontend/
├── .env
├── .env.example
├── .gitignore
├── env.d.ts
├── index.html
├── package.json
├── package-lock.json
├── public/
├── todo-openapi.yaml
├── tsconfig.json
├── src/
│   ├── api/
│   │   ├── client.ts         # API calls
│   │   └── types.ts          # Types and Zod schemas from OpenAPI
│   ├── main.ts               # App entry point (VanJS composition)
│   ├── state.ts              # Store logic
│   ├── style.css             # Global styles
│   ├── ui/
│   │   ├── components.ts     # VanJS components (AddForm, TaskList, Filters, etc.)
│   │   └── styles.css        # Component styles
│   ├── utils/
│   │   ├── format.ts         # Formatting helpers
│   │   └── http.ts           # Fetch wrapper (baseURL, JSON, error handling)
│   ├── counter.ts            # Example file (not used by app)
│   └── vite-env.d.ts
```

## API Reference

This frontend consumes the **Lucky ToDo API**, defined in `todo-openapi.yaml`. Core endpoints (may vary by spec version):

| Method | Path          | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/tasks`      | List all tasks     |
| POST   | `/tasks`      | Create a new task  |
| GET    | `/tasks/{id}` | Get task by ID     |
| PATCH  | `/tasks/{id}` | Update task status |
| DELETE | `/tasks/{id}` | Delete a task      |

## Testing

Run unit tests:

```bash
npm run test
```

> Tests use **Vitest**. Add more tests under `src/` and import your store/helpers.

## Docker Deployment

This app includes production-ready Docker configuration with multi-stage builds, Nginx serving, and SPA routing support.

### Build and run with Docker

```bash
# Build the Docker image with custom API URL
docker build -t todo-frontend --build-arg VITE_API_URL=https://api.example.com .

# Run the container
docker run -p 8080:80 todo-frontend
```

The app will be available at [http://localhost:8080](http://localhost:8080)

### Using Docker Compose

```bash
# Build and run with docker-compose
docker compose up --build
```

The app will be available at [http://localhost:8080](http://localhost:8080)

### Docker Features

- **Multi-stage build**: Optimized production image with minimal size
- **Nginx serving**: Production-ready web server with gzip compression
- **SPA routing**: History mode routing works correctly (no 404s on refresh)
- **Asset caching**: Long-term caching for assets, short cache for index.html
- **Build-time API configuration**: Set `VITE_API_URL` via build args
- **Security headers**: Basic security headers included

### Customizing API URL

You can configure the backend API URL at build time:

```bash
# For production
docker build -t todo-frontend --build-arg VITE_API_URL=https://api.production.com .

# For staging
docker build -t todo-frontend --build-arg VITE_API_URL=https://api.staging.com .
```

Or modify the `docker-compose.yml` file to change the default API URL.

## Traditional Deployment

Any static host works (build emits static files in `dist/`). Popular options:

* **Vercel**
* **Netlify**
* **GitHub Pages**
* Your own Nginx/Apache

Example (Vercel):

```bash
npm run build
vercel deploy dist
```

## License

MIT License © 2025
