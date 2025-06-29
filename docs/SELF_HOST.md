# Sparrow App Installation Guide

This guide provides step-by-step instructions to set up the Sparrow app for different user personas.

## User Personas

1. **Individual Users or Small Teams**  
   Use Docker Compose for a simple one-click deployment with predefined environment variables.

2. **Enterprises**  
   _(Currently not catered to by this guide.)_

3. **Individual Contributors**  
   Run the app locally to contribute to the open-source codebase (API, proxy, auth, or the app itself).

---

## Installation Steps

### 1. Clone the Repository

```bash
# Clone the repo
git clone https://github.com/sparrowapp-dev/sparrow-app

# Move into the project root
cd sparrow-app
```

---

## For Individual Users or Small Teams (Self-Hosting with Docker Compose)

### One-Click Deployment

1. Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your system.

   > You can customize the environment variables in `.env.docker-setup` if required. Refer the [Environment Variable Guide](./ENVIRONMENT_VARIABLE_GUIDE.md) to understand more.

2. Start all services using Docker Compose:

   ```bash
   yarn docker:up
   ```

   This will start the following services:

   - Sparrow Web
   - API Server
   - Auth Server
   - Proxy Server
   - MongoDB

3. Access the Sparrow app via the web browser at [http://localhost:1422](http://localhost:1422).

### Stopping the Services

```bash
yarn docker:down
```

---

By following this guide, you can easily self-host Sparrow for your team. If you encounter issues or have feedback, please create an issue in the [GitHub repository](https://github.com/sparrowapp-dev/sparrow-app/issues).
