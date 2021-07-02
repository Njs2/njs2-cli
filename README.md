Njs2 CLI - A Command Line Interface for Njs2 Framework
================================================

The `@njs2/cli` is a utility cli for Njs2 framework that helps to initialise project, endpoint and run the project in Express or with Serverless.

#### Installation
Install the `@njs2/cli` globally using below command. 
```
npm i -g @njs2/cli
```

#### Getting started with CLI
Once the project is installed, you can directly start working with CLI using `njs2` command.
```
njs2 --help
```

#### Creating new Project
To create a new project invoke `project` command with project name are argument. The command will generate the project structure and install the dependencies for the project.
```
njs2 project project-example
```

#### Creating and endpoint
To create an endpoint go to project directory, then run `endpoint` command with endpoint name as argument. This command with generate the structure for the endpoint.
```
njs2 endpoint user/details
```

#### Run the project
To Run the project in express use `run` command. This will generate the postman definition and start the API and socket server and the postman definition is served at `'api_base_url'/postman` endpoint.
```
njs2 run
```

To Run the project in serverless use `run` command with serverless as the argument. This will generate the postman definition and start the API and socket server and the postman definition is served at `'api_base_url'/postman` endpoint.
```
njs2 run serverless
```