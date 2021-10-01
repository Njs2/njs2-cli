Njs2 CLI - A Command Line Interface for Njs2 Framework
================================================

The `@njs2/cli` is a utility cli for Njs2 framework that helps to initialise project, endpoint and run the project in Express or with Serverless.

## Installation
Install the `@njs2/cli` globally using below command. 
```
npm i -g @njs2/cli
```

## Getting started with CLI
Once the project is installed, you can directly start working with CLI using `njs2` command.
```
njs2 --help
```

## Creating new Project
To create a new project, run `project` command with project name are argument. The command will generate the project structure and install the dependencies for the project.
```
njs2 project <project-name>
```

## Creating and endpoint
To create an endpoint go to project directory, then run `endpoint` command with endpoint name as argument. This command with generate the structure for the endpoint.
```
njs2 endpoint user/details
```

## Run the project
To run the project in express use `run` command. This will generate the postman definition and start the API and socket server and the postman definition is served at `'api_base_url'/postman` endpoint.
```
njs2 run express
```

OR

```
njs2 run
```

To run the project in serverless use `run` command with serverless as the argument. This will generate the postman definition and start the API and socket server and the postman definition is served at `'api_base_url'/postman` endpoint.
```
njs2 run serverless
```

To run the project with nodemon use `run` command with nodemon as the argument. This will generate the postman definition and start the API and socket server and the postman definition is served at `'api_base_url'/postman` endpoint.
```
njs2 run nodemon
```

## Install custom Njs2 packages
To install custom Njs2 packages use `package` command with package name as argument. This will install the package in the project.
```
njs2 package <package-name>
```

## Uninstall custom Njs2 packages
To uninstall custom Njs2 packages use `rm-package` command with package name as argument. This will uninstall the package from the project.
```
njs2 rm-package <package-name>
```

## Compile the Njs2 custom packages
To compile the Njs2 custom packages use `compile` command. This will compile the package in package directory. This command also provides the option sync the package to remote S3 bucket.
```
njs2 compile
```

## Create a package
To create a package use `create-package` command with package name as argument. This will generate the package structure.
```
njs2 create-package <package-name>
```
