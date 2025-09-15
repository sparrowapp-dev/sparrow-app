# Sparrow App Installation Guide

This guide provides minimal instructions to self host the Sparrow app.

---

## Prerequisites

- Git
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Node.js & Yarn

---

## Ports Used

- **1422** → Sparrow Web (UI)
- **5173** → Sparrow Admin Server
- **9000** → Sparrow API Server
- **1421** → Sparrow Auth Server
- **3000** → Sparrow Proxy Server
- **27017** → MongoDB

Make sure these ports are free.

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/sparrowapp-dev/sparrow-app
cd sparrow-app
```

### 2. One-Click Deployment

```bash
yarn docker:up
```

This command starts all required services (Web, Admin, API, Auth, Proxy, MongoDB).

Access Sparrow UI at: [http://localhost:1422](http://localhost:1422)

---

## Stopping the Services

```bash
yarn docker:down
```

---

## Troubleshooting

- Check `.env.docker-setup` for environment variable configuration. Refer the [Environment Variable Guide](./ENVIRONMENT_VARIABLE_GUIDE.md) to understand more.
- If ports are already in use, modify the `docker-compose.yml` accordingly.
- For issues, open a ticket here: [GitHub Issues](https://github.com/sparrowapp-dev/sparrow-app/issues)
