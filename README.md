# DeployOps Monitoring Frontend

React + TypeScript + Vite dashboard for DeployOps Monitoring Platform.

---

## Environment Configuration

Create a `.env` file in the `monitoring_frontend` directory (or copy `.env.example`):

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Full URL of the `monitoring_backend` REST API | `http://localhost:8000` |

> **Note**: Vite requires all client-side environment variables to start with the `VITE_` prefix to be exposed via `import.meta.env`.

Example `.env`:
```ini
VITE_API_URL=http://localhost:8000
```

---

## Development Setup

```bash
# Install dependencies
npm install

# Start local development server with Vite HMR
npm run dev
```

---

## Production Build

```bash
# Type check and build static dist files
npm run build

# Preview build locally
npm run preview
```
