# Preis-Mengen Diagramm (VWL Multi-Editor)

A modern React/Vite application for creating and analyzing supply/demand (price-quantity) diagrams - ideal for economics (VWL) education and teaching.

**Features:**
- 📊 Interactive SVG-based price-quantity diagrams
- 🎨 Dark mode with persistent preference
- 📚 Pre-configured VWL scenarios (equilibrium, demand shift, supply shock, taxes, subsidies)
- 🎛️ Real-time elasticity and position adjustment
- 💾 SVG export functionality
- 🌍 Fully German-localized interface

**Requirements:**
- Node.js 20+ and npm (for local development)
- Docker (for containerized deployment)

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

GitHub Actions (CI/CD)

- **Workflow file:** `.github/workflows/docker-image.yml`
- **Trigger:** Automatically on each push to `main` branch
- **Actions performed:**
  1. Checks out repository code
  2. Sets up Node.js 20 build environment
  3. Builds optimized production-ready Vite bundle
  4. Creates multi-platform Docker image (using Docker Buildx)
  5. Authenticates with GitHub Container Registry (GHCR)
  6. Pushes image to `ghcr.io/aarondolenec/preismengendiagramm:latest`

**Authentication notes:**
- Uses default `GITHUB_TOKEN` (automatically created for public repos)
- For private repos, you may need to create a Personal Access Token with `write:packages` permission and add it as a repository secret `CR_PAT`

## Self-Hosting Guide

### Option 1: Docker Compose (Recommended)

**Easiest and most portable deployment method.**

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  preismengendiagramm:
    image: ghcr.io/aarondolenec/preismengendiagramm:latest
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run:
```bash
# Clone repository
git clone https://github.com/aarondolenec/preismengendiagramm.git
cd preismengendiagramm

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

Access at http://localhost:8080

### Option 2: Local Docker Build

For testing with locally built image:

```bash
# Clone repository
git clone https://github.com/aarondolenec/preismengendiagramm.git
cd preismengendiagramm

# Build Docker image
docker build -t preismengendiagramm:latest .

# Run container (accessible at http://localhost:8080)
docker run -d -p 8080:80 --name preismengendiagramm preismengendiagramm:latest

# View logs
docker logs preismengendiagramm

# Stop container
docker stop preismengendiagramm
```

### Option 3: Using Pre-built Image from GitHub Container Registry

```bash
# Pull latest image from GHCR
docker pull ghcr.io/aarondolenec/preismengendiagramm:latest

# Run container
docker run -d -p 8080:80 --name preismengendiagramm ghcr.io/aarondolenec/preismengendiagramm:latest

# Access at http://localhost:8080
```

### Option 4: Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: preis-mengen-diagramm
spec:
  replicas: 2
  selector:
    matchLabels:
      app: preis-mengen-diagramm
  template:
    metadata:
      labels:
        app: preis-mengen-diagramm
    spec:
      containers:
      - name: preismengendiagramm
        image: ghcr.io/aarondolenec/preismengendiagramm:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: preis-mengen-diagramm-service
spec:
  selector:
    app: preis-mengen-diagramm
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 80
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deployment.yaml
```

### Option 5: Direct Node.js (Development/Testing)

```bash
# Install dependencies
npm install

# Development mode (hot reloading)
npm run dev

# Production build
npm run build
npm run preview
```

## Usage

### Interface Overview

**Sidebar (Left):**
- **Diagramm-Info:** Set custom diagram title
- **VWL-Szenarien:** Quick-load predefined economics scenarios
- **Akteure (Kurven):** Manage supply/demand curves with elasticity controls
- **Staatliche Eingriffe:** Simulate price controls (ceiling/floor)

**Canvas (Right):**
- Interactive SVG diagram with real-time updates
- Click to select/edit diagrams
- Hover for quick actions (export, duplicate, delete)
- Curves labeled with "D" (demand), "S" (supply), or custom names
- Equilibrium point marked as P* (price) and Q* (quantity)

### Features Explained

- **Dark Mode:** Toggle with Sun/Moon icon in header; preference saved to browser localStorage
- **Elasticity Slider:** Control curve steepness (0 = perfectly inelastic/vertical, 100 = perfectly elastic/horizontal)
- **Position Slider:** Shift curve left/right to model market changes
- **Government Interventions:** Add price ceilings or floors to show shortages/surpluses
- **SVG Export:** Download diagrams as scalable vector graphics for presentations

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Curves not visible** | Open browser DevTools (F12) → Console. Check for JavaScript errors. Verify curve parameters are valid (position/elasticity 0-100). |
| **Docker image won't build** | Ensure Node.js 20+ and npm are installed. Run `npm install` before building. |
| **Container exits immediately** | Check logs: `docker logs preismengendiagramm`. Ensure port 8080 is not already in use. |
| **Dark mode preference not saved** | Clear browser cache and localStorage: DevTools → Application → Storage → Clear Site Data. |
| **GHCR authentication fails** | Verify Personal Access Token has `write:packages` permission. Use `ghcr.io` (not `docker.io`). |
| **Performance issues with many curves** | App uses SVG rendering (not Canvas). Consider limiting to 5-10 curves per diagram for smooth interaction. |

