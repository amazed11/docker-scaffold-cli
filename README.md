# Docker Scaffold CLI

A command-line tool to quickly scaffold Docker, docker-compose, and CI/CD configuration files for your projects.

## Installation

### Global Installation (Recommended for CLI usage)

```bash
npm install -g docker-scaffold-cli
```

### Local Development (using npm link)

If you are developing or testing the CLI locally, from the root of this project run:

```bash
npm run build
npm link
```

This will make the `docker-scaffold` command available globally on your system for testing in any folder.

### Local Project Installation

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
- **Database options**
  - Whether to include a database service
  - If yes, which database type (Postgres, MySQL, MongoDB)
- Node.js version
- Production-ready configuration
- GitHub Actions workflow options
  - Main branch for deployment
  - Docker registry preferences (Docker Hub, local-only, or custom registry)
  - Docker Hub username (if using Docker Hub)
  - Deployment target (AWS, Azure, VPS, EC2, etc.)
- Target-specific deployment options:
  - For VPS/custom servers: SSH host, user, and deployment path
  - For AWS: Region and cluster name
  - For Azure: Resource group name
  - For EC2: User, host, repo path, repo URL, branch, build command, SSH key secret, and optional container file copy options

## Generated Files

When you run `docker-scaffold init`, the following files will be created:

- `Dockerfile` - Configuration for building your Docker image
- `docker-compose.yml` - Configuration for running multi-container Docker applications
- `.dockerignore` - Specifies files to be ignored in the Docker build context
- `.github/workflows/deploy.yml` - GitHub Actions workflow for CI/CD and deployment

## Customization

You can customize the generated Docker setup by answering the prompts when running the CLI, or by passing options directly via the command line.

## Example Interactive Usage

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

## Command-Line Options

You can also use command-line options directly (all prompts can be skipped this way):

```bash
docker-scaffold init --projectName=my-app --containerPort=3000 --hostPort=8080 --includeDB=true --dbType=postgres
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

#### EC2 Deployment (with advanced options)

```bash
docker-scaffold init \
  --deploymentTarget=ec2 \
  --ec2User=ec2-user \
  --ec2Host=ec2-host.example.com \
  --ec2RepoPath=/var/www/app \
  --ec2RepoUrl=git@github.com:username/repo.git \
  --ec2RepoBranch=main \
  --ec2BuildCommand="docker-compose up --build -d" \
  --ec2SshKeyName=EC2_SSH_KEY \
  --ec2UseCustomContainer=true \
  --ec2ContainerPath=/usr/share/nginx/html \
  --ec2LocalPath=./dist
```

## Local Development & Testing

If you are developing this CLI and want to test it in other projects, use:

```bash
npm run build
npm link
```

Then, in any other project directory, you can run:

```bash
docker-scaffold init
```

To remove the global link later:

```bash
npm unlink -g docker-scaffold-cli
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.
