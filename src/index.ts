#!/usr/bin/env node
// src/index.ts

import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import path from "path";
import { generateFiles } from "./utils/writer";

// Import package.json with TypeScript
interface PackageJson {
  version: string;
  [key: string]: any;
}
const pkg: PackageJson = require("../package.json");

const program = new Command();

program
  .name("docker-scaffold")
  .description("CLI to scaffold Docker and CI/CD setup")
  .version(pkg.version);

interface CommandOptions {
  projectName?: string;
  containerPort?: string;
  hostPort?: string;
  includeDB?: boolean | string;
  dbType?: string;
  nodeVersion?: string;
  production?: boolean;
  // GitHub workflow options
  deploymentTarget?: string;
  mainBranch?: string;
  // Docker registry options
  useDockerRegistry?: boolean | string;
  dockerRegistry?: string;
  dockerUsername?: string;
  includeWorkflow?: boolean | string;
  // SSH deployment options (VPS, DigitalOcean, Other)
  sshHost?: string;
  sshUser?: string;
  sshPath?: string;
  // AWS specific options
  awsRegion?: string;
  awsCluster?: string;
  // Azure specific options
  azureResourceGroup?: string;
  // EC2 specific deployment options
  ec2User?: string;
  ec2Host?: string;
  ec2RepoPath?: string;
  ec2RepoUrl?: string;
  ec2RepoBranch?: string;
  ec2BuildCommand?: string;
  ec2SshKeyName?: string;
  ec2UseCustomContainer?: boolean | string;
  ec2ContainerPath?: string;
  ec2LocalPath?: string;
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
}

program
  .command("init")
  .description("Generate Docker, Compose, and GitHub Actions workflow")
  .option("-p, --projectName <n>", "Name of your project")
  .option("-c, --containerPort <port>", "Port exposed inside container")
  .option("-h, --hostPort <port>", "Port mapped on host machine")
  .option("-d, --includeDB <boolean>", "Include database service")
  .option("--dbType <type>", "Database type (postgres, mysql, mongodb)")
  .option("--nodeVersion <version>", "Node.js version to use", "20")
  .option("--production", "Generate production-ready configuration")
  .option(
    "--includeWorkflow <boolean>",
    "Include GitHub Actions workflow",
    true
  )
  .option("--mainBranch <branch>", "Main branch to trigger deployment")
  .option("--useDockerRegistry <boolean>", "Use a Docker image registry")
  .option(
    "--dockerRegistry <registry>",
    "Docker registry to use (dockerhub, local, other)",
    "dockerhub"
  )
  .option(
    "--dockerUsername <username>",
    "Docker Hub username for pushing images"
  )
  .option(
    "--deploymentTarget <target>",
    "Deployment target (aws, digitalocean, vps, azure, local)"
  )
  // New options for deployment via SSH
  .option("--sshHost <host>", "SSH host for deployment")
  .option("--sshUser <user>", "SSH user for deployment")
  .option("--sshPath <path>", "Path on server to deploy to")
  // AWS specific options
  .option("--awsRegion <region>", "AWS region for deployment")
  .option("--awsCluster <cluster>", "AWS ECS cluster name")
  // Azure specific options
  .option("--azureResourceGroup <group>", "Azure resource group name")
  // EC2 specific deployment options
  .option("--ec2User <user>", "EC2 instance user (e.g., ec2-user)")
  .option("--ec2Host <host>", "EC2 instance hostname or IP")
  .option("--ec2RepoPath <path>", "Path on EC2 where the repo will be cloned")
  .option("--ec2RepoUrl <url>", "Git repository URL for EC2 deployment")
  .option("--ec2RepoBranch <branch>", "Git branch to deploy on EC2")
  .option(
    "--ec2BuildCommand <command>",
    "Custom build command for EC2 deployment"
  )
  .option(
    "--ec2SshKeyName <name>",
    "Name of the SSH key secret for EC2 deployment"
  )
  .option(
    "--ec2UseCustomContainer <boolean>",
    "Whether to copy files from Docker container after deployment"
  )
  .option(
    "--ec2ContainerPath <path>",
    "Path inside container to copy files from"
  )
  .option("--ec2LocalPath <path>", "Local path on EC2 to copy files to")
  .action(async (cmdOptions: CommandOptions) => {
    // Header
    console.log(chalk.blue.bold("\n📦 Docker Scaffold CLI"));
    console.log(
      chalk.blue("Generate Docker configuration files for your project")
    );
    console.log(chalk.grey("-".repeat(50)) + "\n");

    // Use command line options or prompt for values
    const options: Partial<Config> = {};

    if (cmdOptions.projectName) {
      options.projectName = cmdOptions.projectName;
    }
    if (cmdOptions.containerPort) {
      options.containerPort = cmdOptions.containerPort;
    }
    if (cmdOptions.hostPort) {
      options.hostPort = cmdOptions.hostPort;
    }
    if (cmdOptions.includeDB !== undefined) {
      options.includeDB =
        cmdOptions.includeDB === "true" || cmdOptions.includeDB === true;
    }
    if (cmdOptions.dbType) {
      options.dbType = cmdOptions.dbType;
    }
    if (cmdOptions.nodeVersion) {
      options.nodeVersion = cmdOptions.nodeVersion;
    }
    if (cmdOptions.production !== undefined) {
      options.production = cmdOptions.production;
    }

    // Set values for new GitHub workflow options
    if (cmdOptions.includeWorkflow !== undefined) {
      options.includeWorkflow =
        cmdOptions.includeWorkflow === "true" ||
        cmdOptions.includeWorkflow === true;
    }
    if (cmdOptions.mainBranch) {
      options.mainBranch = cmdOptions.mainBranch;
    }

    // Set values for Docker registry options
    if (cmdOptions.useDockerRegistry !== undefined) {
      options.useDockerRegistry =
        cmdOptions.useDockerRegistry === "true" ||
        cmdOptions.useDockerRegistry === true;
    }
    if (cmdOptions.dockerRegistry) {
      options.dockerRegistry = cmdOptions.dockerRegistry;
    }
    if (cmdOptions.dockerUsername) {
      options.dockerUsername = cmdOptions.dockerUsername;
    }

    if (cmdOptions.deploymentTarget) {
      options.deploymentTarget = cmdOptions.deploymentTarget;
    }

    // Set values for deployment via SSH options
    if (cmdOptions.sshHost) {
      options.sshHost = cmdOptions.sshHost;
    }
    if (cmdOptions.sshUser) {
      options.sshUser = cmdOptions.sshUser;
    }
    if (cmdOptions.sshPath) {
      options.sshPath = cmdOptions.sshPath;
    }

    // Set values for AWS specific options
    if (cmdOptions.awsRegion) {
      options.awsRegion = cmdOptions.awsRegion;
    }
    if (cmdOptions.awsCluster) {
      options.awsCluster = cmdOptions.awsCluster;
    }

    // Set values for Azure specific options
    if (cmdOptions.azureResourceGroup) {
      options.azureResourceGroup = cmdOptions.azureResourceGroup;
    }

    // Set values for EC2 specific options
    if (cmdOptions.ec2User) {
      options.ec2User = cmdOptions.ec2User;
    }
    if (cmdOptions.ec2Host) {
      options.ec2Host = cmdOptions.ec2Host;
    }
    if (cmdOptions.ec2RepoPath) {
      options.ec2RepoPath = cmdOptions.ec2RepoPath;
    }
    if (cmdOptions.ec2RepoUrl) {
      options.ec2RepoUrl = cmdOptions.ec2RepoUrl;
    }
    if (cmdOptions.ec2RepoBranch) {
      options.ec2RepoBranch = cmdOptions.ec2RepoBranch;
    }
    if (cmdOptions.ec2BuildCommand) {
      options.ec2BuildCommand = cmdOptions.ec2BuildCommand;
    }
    if (cmdOptions.ec2SshKeyName) {
      options.ec2SshKeyName = cmdOptions.ec2SshKeyName;
    }
    if (cmdOptions.ec2UseCustomContainer !== undefined) {
      options.ec2UseCustomContainer =
        cmdOptions.ec2UseCustomContainer === "true" ||
        cmdOptions.ec2UseCustomContainer === true;
    }
    if (cmdOptions.ec2ContainerPath) {
      options.ec2ContainerPath = cmdOptions.ec2ContainerPath;
    }
    if (cmdOptions.ec2LocalPath) {
      options.ec2LocalPath = cmdOptions.ec2LocalPath;
    }

    // Prompt for any missing values
    const questions = [];

    if (!options.projectName) {
      questions.push({
        name: "projectName",
        message: "Project name:",
        default: path.basename(process.cwd()),
      });
    }

    if (!options.containerPort) {
      questions.push({
        name: "containerPort",
        message: "Port inside container:",
        default: "3000",
      });
    }

    if (!options.hostPort) {
      questions.push({
        name: "hostPort",
        message: "Port on host machine:",
        default: "3000",
      });
    }

    // Make sure the includeDB prompt is always shown unless explicitly set via command line
    if (options.includeDB === undefined) {
      questions.push({
        type: "confirm",
        name: "includeDB",
        message: "Include database service?",
        default: true,
      });
    }

    // Ask for database type only if a database is included
    if (options.dbType === undefined) {
      questions.push({
        type: "list",
        name: "dbType",
        message: "Choose database type:",
        choices: ["postgres", "mysql", "mongodb"],
        default: "postgres",
        when: (answers: any) => {
          // If includeDB was set via command line, use that value
          if (options.includeDB !== undefined) {
            return options.includeDB;
          }
          // Otherwise use the answer from the previous question
          return answers.includeDB;
        },
      });
    }

    if (!options.nodeVersion) {
      questions.push({
        type: "list",
        name: "nodeVersion",
        message: "Node.js version:",
        choices: ["18", "20", "latest"],
        default: "18",
      });
    }

    if (options.production === undefined) {
      questions.push({
        type: "confirm",
        name: "production",
        message: "Generate production-ready configuration?",
        default: false,
      });
    }

    // GitHub workflow options
    if (options.includeWorkflow === undefined) {
      questions.push({
        type: "confirm",
        name: "includeWorkflow",
        message: "Include GitHub Actions workflow?",
        default: true,
      });
    }

    // Docker registry options
    if (options.useDockerRegistry === undefined) {
      questions.push({
        type: "confirm",
        name: "useDockerRegistry",
        message: "Use Docker image registry?",
        default: true,
        when: (answers: any) =>
          answers.includeWorkflow || options.includeWorkflow,
      });
    }

    if (options.dockerRegistry === undefined) {
      questions.push({
        type: "list",
        name: "dockerRegistry",
        message: "Choose Docker registry type:",
        choices: [
          { name: "Docker Hub", value: "dockerhub" },
          { name: "Local (no registry, build locally only)", value: "local" },
          { name: "Other registry (AWS ECR, GitHub, etc.)", value: "other" },
        ],
        default: "dockerhub",
        when: (answers: any) => {
          return (
            (answers.useDockerRegistry || options.useDockerRegistry) &&
            (answers.includeWorkflow || options.includeWorkflow)
          );
        },
      });
    }

    // Only ask workflow-related questions if includeWorkflow is true
    const workflowQuestions = [
      {
        name: "mainBranch",
        message: "Main branch to trigger deployment:",
        default: "main",
        when: (answers: any) =>
          answers.includeWorkflow || options.includeWorkflow,
      },
      {
        name: "dockerUsername",
        message: "Docker Hub username (for pushing images):",
        default: "yourusername",
        when: (answers: any) => {
          const useRegistry =
            answers.useDockerRegistry !== undefined
              ? answers.useDockerRegistry
              : options.useDockerRegistry;

          const registry = answers.dockerRegistry || options.dockerRegistry;

          return (
            (answers.includeWorkflow || options.includeWorkflow) &&
            useRegistry &&
            registry === "dockerhub"
          );
        },
      },
      {
        type: "list",
        name: "deploymentTarget",
        message: "Choose deployment target:",
        choices: [
          "aws",
          "digitalocean",
          "vps",
          "azure",
          "local",
          "ec2",
          "other",
        ],
        default: "vps",
        when: (answers: any) =>
          answers.includeWorkflow || options.includeWorkflow,
      },
    ];

    questions.push(
      ...workflowQuestions.filter((q) => {
        const optionName = q.name as keyof Config;
        return options[optionName] === undefined;
      })
    );

    // Get deployment target-specific questions
    const getTargetSpecificQuestions = (answers: any) => {
      const target = answers.deploymentTarget || options.deploymentTarget;
      const includeWorkflow =
        answers.includeWorkflow || options.includeWorkflow;

      if (!includeWorkflow) {
        return [];
      }

      // SSH deployment options - for VPS, DigitalOcean, Other
      if (["vps", "digitalocean", "other"].includes(target)) {
        return [
          {
            name: "sshHost",
            message: "SSH host for deployment (e.g., example.com):",
            when: () => true,
          },
          {
            name: "sshUser",
            message: "SSH user for deployment:",
            default: "deploy",
            when: () => true,
          },
          {
            name: "sshPath",
            message: "Path on server to deploy to:",
            default: "/var/www/app",
            when: () => true,
          },
        ];
      }
      // AWS specific questions
      else if (target === "aws") {
        return [
          {
            name: "awsRegion",
            message: "AWS region for deployment:",
            default: "us-east-1",
            when: () => true,
          },
          {
            name: "awsCluster",
            message: "AWS ECS cluster name:",
            default: `${
              answers.projectName || options.projectName || "app"
            }-cluster`,
            when: () => true,
          },
        ];
      }
      // Azure specific questions
      else if (target === "azure") {
        return [
          {
            name: "azureResourceGroup",
            message: "Azure resource group name:",
            default: `${
              answers.projectName || options.projectName || "app"
            }-resources`,
            when: () => true,
          },
        ];
      }
      // EC2 specific questions
      else if (target === "ec2") {
        return [
          {
            name: "ec2User",
            message: "EC2 instance user:",
            default: "ec2-user",
            when: () => true,
          },
          {
            name: "ec2Host",
            message: "EC2 instance hostname or IP:",
            default: "your-ec2-instance.example.com",
            when: () => true,
          },
          {
            name: "ec2RepoPath",
            message: "Path on EC2 to deploy to:",
            default: "/var/www/app",
            when: () => true,
          },
          {
            name: "ec2RepoUrl",
            message: "Git repository URL for EC2 deployment:",
            default: "git@github.com:username/repo.git",
            when: () => true,
          },
          {
            name: "ec2RepoBranch",
            message: "Git branch to deploy on EC2:",
            default: (answers: any) =>
              answers.mainBranch || options.mainBranch || "main",
            when: () => true,
          },
          {
            name: "ec2BuildCommand",
            message:
              "Build command to run on EC2 (docker-compose or other build command):",
            default: "docker-compose up --build -d",
            when: () => true,
          },
          {
            name: "ec2SshKeyName",
            message: "Name of GitHub secret for the SSH key:",
            default: "EC2_SSH_KEY",
            when: () => true,
          },
          {
            name: "ec2UseCustomContainer",
            message:
              "Do you need to access files from the Docker container after build? (useful for static sites)",
            type: "confirm",
            default: false,
            when: (answers: any) =>
              answers.ec2BuildCommand?.includes("docker") ||
              options.ec2BuildCommand?.includes("docker"),
          },
          {
            name: "ec2ContainerPath",
            message:
              "Path inside container to copy files from (e.g., /app/build):",
            default: "/usr/share/nginx/html",
            when: (answers: any) =>
              answers.ec2UseCustomContainer || options.ec2UseCustomContainer,
          },
          {
            name: "ec2LocalPath",
            message: "Local path on EC2 to copy files to (e.g., ./dist):",
            default: "./dist",
            when: (answers: any) =>
              answers.ec2UseCustomContainer || options.ec2UseCustomContainer,
          },
        ];
      }

      return [];
    };

    // This will be executed after deployment target is selected
    const targetSpecificQuestions = {
      type: "target-specific",
      name: "deploymentDetails",
      message: "Deployment details:",
      // This will be replaced with actual questions based on the selected target
      when: (answers: any) => {
        // First push the specific questions for the selected target
        const targetQuestions = getTargetSpecificQuestions(answers);
        questions.push(
          ...targetQuestions.filter((q) => {
            const optionName = q.name as keyof Config;
            return options[optionName] === undefined;
          })
        );

        // Then skip this placeholder question
        return false;
      },
    };

    // Add this placeholder question that will add the real questions when executed
    questions.push(targetSpecificQuestions);

    // Get answers from prompts
    const answers =
      questions.length > 0 ? await inquirer.prompt(questions) : {};

    // Combine command line options and prompt answers
    const config = { ...options, ...answers } as Config;

    console.log(chalk.yellow("\nGenerating Docker configuration files..."));

    try {
      await generateFiles(config);

      console.log(chalk.green("\n✅ All files generated successfully!"));
      console.log("\nFiles created:");
      console.log(chalk.cyan("  - Dockerfile"));
      console.log(chalk.cyan("  - docker-compose.yml"));
      console.log(chalk.cyan("  - .dockerignore"));
      console.log(chalk.cyan("  - .github/workflows/deploy.yml"));

      console.log(chalk.yellow("\nNext steps:"));
      console.log(
        "  1. Review the generated files and make any necessary adjustments"
      );
      console.log(
        "  2. Build your Docker image: " + chalk.bold("docker compose build")
      );
      console.log(
        "  3. Start your containers: " + chalk.bold("docker compose up")
      );

      // Show GitHub Actions workflow setup instructions if workflow is included
      if (config.includeWorkflow) {
        console.log(chalk.yellow("\nGitHub Actions setup:"));
        console.log("  1. Add these secrets to your GitHub repository:");
        console.log(
          "     - " +
            chalk.bold("DOCKER_USERNAME") +
            ": Your Docker Hub username"
        );
        console.log(
          "     - " +
            chalk.bold("DOCKER_PASSWORD") +
            ": Your Docker Hub password or token"
        );

        // Show deployment-specific secrets based on target
        if (config.deploymentTarget === "aws") {
          console.log(
            "     - " +
              chalk.bold("AWS_ACCESS_KEY_ID") +
              ": Your AWS access key"
          );
          console.log(
            "     - " +
              chalk.bold("AWS_SECRET_ACCESS_KEY") +
              ": Your AWS secret key"
          );
          console.log(
            "     - " + chalk.bold("AWS_REGION") + ": Your AWS region"
          );
        } else if (config.deploymentTarget === "azure") {
          console.log(
            "     - " +
              chalk.bold("AZURE_CREDENTIALS") +
              ": Your Azure credentials JSON"
          );
        } else if (
          ["vps", "digitalocean", "other"].includes(config.deploymentTarget)
        ) {
          console.log(
            "     - " +
              chalk.bold("SSH_PRIVATE_KEY") +
              ": Your private SSH key for deployment"
          );
        }

        console.log("  2. Push your code to GitHub to trigger the workflow");
      }
    } catch (error: any) {
      console.error(chalk.red("\n❌ Error generating files:"), error.message);
      process.exit(1);
    }
  });

program.parse();
