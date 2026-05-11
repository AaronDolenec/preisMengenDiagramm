# Preis-Mengen Diagramm (VWL Multi-Editor)

This repository contains a small React app (Vite) for editing simple supply/demand diagrams.

Quick start (local):

1. Install dependencies

```bash
npm ci
```

2. Run dev server

```bash
npm run dev
```

3. Build production bundle

```bash
npm run build
```

Docker:

Build locally:

```bash
docker build -t preismengendiagramm:latest .
docker run -p 8080:80 preismengendiagramm:latest
```

CI/CD:

The repository includes a GitHub Actions workflow `.github/workflows/docker-image.yml` that builds and pushes the container to GitHub Container Registry (`ghcr.io`) when pushed to `main`.
