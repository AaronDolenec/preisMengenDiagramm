# Preis-Mengen Diagramm (VWL Multi-Editor)

This repository contains a small React app (Vite) for editing supply/demand diagrams.

Requirements
- Node.js 20+ and npm (for local development)
- Docker (for local container build)

Local development

1. Install dependencies:

```bash
npm install
```

2. Start dev server (Vite):

```bash
npm run dev
```

Production build

```bash
npm run build
npm run preview
```

Run with Docker (local)

1. Build image:

```bash
docker build -t preismengendiagramm:local .
```

2. Run container (serves on port 8080):

```bash
docker run -d --rm -p 8080:80 --name preismengendiagramm preismengendiagramm:local
```

3. Open http://localhost:8080

GitHub Actions (CI)

- Workflow: `.github/workflows/docker-image.yml`
- What it does: Installs Node.js, builds the Vite app, builds a multi-platform Docker image with Buildx, logs into GitHub Container Registry, and pushes the image to `ghcr.io/${{ github.repository_owner }}/preismengendiagramm:latest` on pushes to `main`.

Important notes for CI:
- The workflow uses the repository `GITHUB_TOKEN` to authenticate with GHCR. For public pushes this works automatically; for private images or cross-organization pushes you may need a Personal Access Token stored in `GITHUB_TOKEN` or `CR_PAT` as a repository secret.

How to publish manually to GHCR (optional)

```bash
echo "$(gh auth token)" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/preismengendiagramm:latest .
docker push ghcr.io/YOUR_GITHUB_USERNAME/preismengendiagramm:latest
```

Troubleshooting
- If curves are not visible in the browser, open the devtools console for errors. This app renders curves as SVG lines; missing or NaN coordinates are usually due to invalid curve props.

