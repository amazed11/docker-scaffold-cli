# Templates Directory

This directory contains EJS template files used by Docker Scaffold CLI to generate Docker configuration files and CI/CD workflows based on user input.

## How Templates Work

The Docker Scaffold CLI uses [EJS (Embedded JavaScript)](https://ejs.co/) as the templating engine to dynamically generate configuration files. When you run `docker-scaffold init`, the CLI:

1. **Collects user input** through interactive prompts
2. **Processes templates** by replacing EJS variables with actual values
3. **Generates final files** in your project directory

## Template Files

### 1. `Dockerfile.ejs`

Generates a `Dockerfile` for containerizing your Node.js application.

**Key Variables:**

- `nodeVersion` - Node.js version (e.g., "18", "20")
- `production` - Boolean for production-ready configuration
- `containerPort` - Port exposed inside the container

**Example Output:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
```

### 2. `docker-compose.ejs`

Generates a `docker-compose.yml` file for multi-container applications.

**Key Variables:**

- `projectName` - Name of your project
- `hostPort` / `containerPort` - Port mapping
- `includeDB` - Boolean to include database service
- `dbType` - Database type ("postgres", "mysql", "mongodb")
- `useDockerRegistry` - Boolean for using Docker registry
- `dockerUsername` - Docker Hub username

**Example Output:**

```yaml
version: "3.8"
services:
  my-app:
    build: .
    container_name: my-app-app
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
      - /app/node_modules
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: my-app_db
```

### 3. `deploy.yml.ejs`

Generates a GitHub Actions workflow file (`.github/workflows/deploy.yml`) for CI/CD.

**Key Variables:**

- `deploymentTarget` - Target platform ("vps", "aws", "azure", "ec2")
- `mainBranch` - Git branch to trigger deployment
- `useDockerRegistry` - Boolean for Docker registry usage
- `dockerRegistry` - Registry type ("dockerhub", "other")
- `sshHost`, `sshUser`, `sshPath` - SSH deployment configuration

**Example Output:**

```yaml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Deploy to VPS
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} 'cd /var/www/app && git pull'
```

## EJS Syntax Used

### Variable Interpolation

```ejs
<%- variableName %>
```

Outputs the value of `variableName` without HTML escaping.

### Conditional Blocks

```ejs
<%_ if (condition) { _%>
  Content when condition is true
<%_ } else { _%>
  Content when condition is false
<%_ } _%>
```

### Loops (used in some templates)

```ejs
<% items.forEach(function(item) { %>
  <div><%= item %></div>
<% }); %>
```

## Configuration Variables

All templates receive a configuration object with the following properties:

### Basic Configuration

- `projectName` - Project name
- `containerPort` - Port inside container
- `hostPort` - Port on host machine
- `nodeVersion` - Node.js version
- `production` - Production-ready configuration flag

### Database Configuration

- `includeDB` - Include database service
- `dbType` - Database type ("postgres", "mysql", "mongodb")

### Docker Registry Configuration

- `useDockerRegistry` - Use Docker image registry
- `dockerRegistry` - Registry type ("dockerhub", "other")
- `dockerUsername` - Docker Hub username

### Deployment Configuration

- `includeWorkflow` - Include GitHub Actions workflow
- `deploymentTarget` - Deployment target ("vps", "aws", "azure", "ec2")
- `mainBranch` - Main branch for deployment

### Target-Specific Configuration

#### VPS/SSH Deployment

- `sshHost` - SSH hostname
- `sshUser` - SSH username
- `sshPath` - Deployment path on server

#### AWS Deployment

- `awsRegion` - AWS region
- `awsCluster` - ECS cluster name

#### Azure Deployment

- `azureResourceGroup` - Azure resource group

#### EC2 Deployment

- `ec2User` - EC2 SSH username
- `ec2Host` - EC2 instance hostname
- `ec2RepoPath` - Repository path on EC2
- `ec2RepoUrl` - Git repository URL
- `ec2RepoBranch` - Git branch
- `ec2BuildCommand` - Build command
- `ec2SshKeyName` - SSH key secret name
- `ec2UseCustomContainer` - Use custom container copying
- `ec2ContainerPath` - Container path for file copying
- `ec2LocalPath` - Local path for file copying

## Adding New Templates

To add a new template:

1. **Create the template file** in this directory with `.ejs` extension
2. **Add template configuration** in `src/utils/writer.ts`:
   ```typescript
   const templates: Template[] = [
     // existing templates...
     { src: "your-template.ejs", dest: "output-filename" },
   ];
   ```
3. **Use EJS syntax** to make the template dynamic
4. **Test with different configurations** to ensure it works correctly

## Example Template Development

Here's a simple example of creating a new template for a `.env` file:

**`env.ejs`:**

```ejs
# Environment variables for <%- projectName %>
NODE_ENV=<%- production ? 'production' : 'development' %>
PORT=<%- containerPort %>

<%_ if (includeDB) { _%>
# Database configuration
<%_ if (dbType === 'postgres') { _%>
DATABASE_URL=postgresql://postgres:postgres@db:5432/<%- projectName %>_db
<%_ } else if (dbType === 'mysql') { _%>
DATABASE_URL=mysql://user:password@db:3306/<%- projectName %>_db
<%_ } _%>
<%_ } _%>
```

**Add to `writer.ts`:**

```typescript
{ src: "env.ejs", dest: ".env.example" }
```

This would generate a `.env.example` file with appropriate environment variables based on user configuration.

## Best Practices

1. **Use descriptive variable names** that clearly indicate their purpose
2. **Provide sensible defaults** in the configuration object
3. **Test templates** with different configuration combinations
4. **Comment complex conditional logic** in templates
5. **Validate generated output** to ensure it's syntactically correct
6. **Follow established patterns** from existing templates
