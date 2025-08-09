# ToDo App Frontend

A lightweight ToDo web app frontend using Vite, TypeScript, and VanJS. Consumes a REST API defined in OpenAPI (see `todo-openapi.yaml`).

## Getting Started

```sh
npm install
cp .env.example .env
# Set VITE_API_BASE_URL in .env (defaults to sandbox server from OpenAPI)
npm run dev
```

## Build & Preview

```sh
npm run build
npm run preview
```

## Testing

```sh
npm run test
```

## Environment Switching

- The default API base URL is the sandbox server from the OpenAPI file.
- You can override it by setting `VITE_API_BASE_URL` in your `.env` file.

---

- UI: VanJS (no React)
- State: Minimal observable store
- API: Typed client, Zod validation
- CSS: Tiny, responsive, no framework
