# Docker Scaffold CLI

A command-line tool to quickly scaffold Docker configuration files for your projects.

## Installation

### Global Installation

```bash
npm install -g docker-scaffold-cli
```

### Local Installation

```bash
npm install --save-dev docker-scaffold-cli
```

Then you can use it with npx:

```bash
npx docker-scaffold init
```

## Usage

Run the initialization command to generate Docker configuration files:

```bash
docker-scaffold init
```

The CLI will prompt you for:

- Project name
- Container port
- Host port
- Database options
- GitHub Actions workflow options
  - Main branch for deployment
  - Docker registry preferences (Docker Hub, local-only, or custom registry)
  - Docker Hub username (if using Docker Hub)
  - Deployment target (AWS, Azure, VPS, etc.)
- Target-specific deployment options:
  - For VPS/custom servers: SSH host, user, and deployment path
  - For AWS: Region and cluster name
  - For Azure: Resource group name

## Generated Files

When you run `docker-scaffold init`, the following files will be created:

- `Dockerfile` - Configuration for building your Docker image
- `docker-compose.yml` - Configuration for running multi-container Docker applications
- `.dockerignore` - Specifies files to be ignored in the Docker build context
- `.github/workflows/deploy.yml` - GitHub Actions workflow for CI/CD

## Customization

You can customize the generated Docker setup by answering the prompts when running the CLI.

## Example

```bash
$ docker-scaffold init
? Project name: my-awesome-app
? Port inside container: 3000
? Port on host machine: 8080
? Include database service? Yes
? Choose database type: postgres
? Node.js version: 18
? Generate production-ready configuration? Yes
? Include GitHub Actions workflow? Yes
? Main branch to trigger deployment: main
? Use Docker image registry? Yes
? Choose Docker registry type: Docker Hub
? Docker Hub username (for pushing images): yourusername
? Choose deployment target: vps
? SSH host for deployment (e.g., example.com): my-vps.example.com
? SSH user for deployment: deploy
? Path on server to deploy to: /var/www/my-awesome-app

✅ All files generated successfully!
```

## Options

You can also use command-line options directly:

```bash
docker-scaffold init --projectName=my-app --containerPort=3000 --hostPort=8080 --includeDB=true
```

### Workflow and Deployment Options

For CI/CD workflow customization:

```bash
docker-scaffold init --includeWorkflow=true --mainBranch=main --deploymentTarget=vps
```

#### Docker Registry Options

Using Docker Hub:

```bash
docker-scaffold init --useDockerRegistry=true --dockerRegistry=dockerhub --dockerUsername=yourusername
```

Using a local build only (no registry):

```bash
docker-scaffold init --useDockerRegistry=false
```

Using a custom registry:

```bash
docker-scaffold init --useDockerRegistry=true --dockerRegistry=other
```

#### VPS/Custom Server Deployment

```bash
docker-scaffold init --deploymentTarget=vps --sshHost=example.com --sshUser=deploy --sshPath=/var/www/app
```

#### AWS Deployment

```bash
docker-scaffold init --deploymentTarget=aws --awsRegion=us-east-1 --awsCluster=my-app-cluster
```

#### Azure Deployment

```bash
docker-scaffold init --deploymentTarget=azure --azureResourceGroup=my-app-resources
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
