import chalk from "chalk";
import ejs from "ejs";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";

interface Template {
  src: string;
  dest: string;
}

interface Config {
  projectName: string;
  containerPort: string;
  hostPort: string;
  includeDB: boolean;
  dbType: string;
  nodeVersion: string;
  production: boolean;
  // GitHub workflow options
  deploymentTarget: string;
  mainBranch: string;
  // Docker registry options
  useDockerRegistry: boolean;
  dockerRegistry: string; // "dockerhub" or "local" or "other"
  dockerUsername: string;
  includeWorkflow: boolean;
  // SSH deployment options (VPS, DigitalOcean, Other)
  sshHost: string;
  sshUser: string;
  sshPath: string;
  // AWS specific options
  awsRegion: string;
  awsCluster: string;
  // Azure specific options
  azureResourceGroup: string;
  // EC2 specific deployment options
  ec2User: string;
  ec2Host: string;
  ec2RepoPath: string;
  ec2RepoUrl: string;
  ec2RepoBranch: string;
  ec2BuildCommand: string;
  ec2SshKeyName: string;
  ec2UseCustomContainer: boolean;
  ec2ContainerPath: string;
  ec2LocalPath: string;
  [key: string]: any;
}

const templates: Template[] = [
  { src: "Dockerfile.ejs", dest: "Dockerfile" },
  { src: "docker-compose.ejs", dest: "docker-compose.yml" },
  { src: ".dockerignore", dest: ".dockerignore" },
  { src: "deploy.yml.ejs", dest: ".github/workflows/deploy.yml" },
];

/**
 * Generate Docker configuration files based on user inputs
 * @param {Config} data - Configuration data
 * @returns {Promise<void>}
 */
export async function generateFiles(data: Partial<Config>): Promise<void> {
  // Add default values for any missing fields
  const config: Config = {
    projectName: "my-app",
    containerPort: "3000",
    hostPort: "3000",
    includeDB: true,
    dbType: "postgres",
    nodeVersion: "18",
    production: false,
    // Default values for GitHub workflow options
    includeWorkflow: true,
    mainBranch: "main",
    // Default values for Docker registry options
    useDockerRegistry: true,
    dockerRegistry: "dockerhub",
    dockerUsername: "yourusername",
    deploymentTarget: "vps",
    // Default values for SSH deployment options
    sshHost: "example.com",
    sshUser: "deploy",
    sshPath: "/var/www/app",
    // Default values for AWS specific options
    awsRegion: "us-east-1",
    awsCluster: "my-app-cluster",
    // Default values for Azure specific options
    azureResourceGroup: "my-app-resources",
    // Default values for EC2 specific options
    ec2User: "ec2-user",
    ec2Host: "your-ec2-instance.example.com",
    ec2RepoPath: "/var/www/app",
    ec2RepoUrl: "git@github.com:username/repo.git",
    ec2RepoBranch: "main",
    ec2BuildCommand: "docker-compose up --build -d",
    ec2SshKeyName: "EC2_SSH_KEY",
    ec2UseCustomContainer: false,
    ec2ContainerPath: "/usr/share/nginx/html",
    ec2LocalPath: "./dist",
    ...data,
  };

  // Check for existing files to avoid overwriting
  const existingFiles: string[] = [];
  for (const tpl of templates) {
    const destPath = path.join(process.cwd(), tpl.dest);
    if (await fs.pathExists(destPath)) {
      existingFiles.push(tpl.dest);
    }
  }

  // Warn if files would be overwritten
  if (existingFiles.length > 0) {
    console.log(
      chalk.yellow("\n⚠️  Warning: The following files already exist:")
    );
    existingFiles.forEach((file) => console.log(`  - ${file}`));

    // Ask for confirmation to overwrite
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "Do you want to overwrite these files?",
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(
        chalk.yellow("⚠️  Operation cancelled. No files were modified.")
      );
      process.exit(0);
    }
  }

  // Generate each template file
  for (const tpl of templates) {
    try {
      const srcPath = path.join(__dirname, "..", "..", "templates", tpl.src);
      const destPath = path.join(process.cwd(), tpl.dest);

      // Create directory if it doesn't exist
      await fs.ensureDir(path.dirname(destPath));

      // Render template with user configuration
      const rendered = await ejs.renderFile(srcPath, config);

      // Write file
      await fs.writeFile(destPath, rendered);

      console.log(`  - Generated ${chalk.green(tpl.dest)}`);
    } catch (error: any) {
      console.error(
        chalk.red(`  ❌ Error generating ${tpl.dest}:`),
        error.message
      );
      throw error; // Re-throw to handle in the calling function
    }
  }
}
