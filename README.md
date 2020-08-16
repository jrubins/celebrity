## Celebrity

This is a repository for a Celebrity game.

## Table of Contents

- [Running the project](#running-the-project)
- [Compilation](#compilation)
- [Code Formatting](#code-formatting)
- [Deployment](#deployment)

## Running the project

To get the project running, we'll need to install a couple of dependencies.

### Installing dependencies

Celebrity depends on Node.js and Yarn, so we'll need to get those set up.

**Installing NVM**

To manage Node.js, we'll want to use [NVM](https://github.com/creationix/nvm). NVM is a Node.js version manager and allows you to easily install, switch between and uninstall different Node versions. To install NVM, run:

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
```

This script will clone the NVM repository to `~/.nvm` and add the following to your profile (`~/.bash_profile`):

```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

To verify that nvm has been installed, run:

```
$ command -v nvm
```

which should output `nvm`.

If you run the command `nvm` you should see help output. If you don't see anything, open a new terminal or run the following command:

```
$ source ~/.bash_profile
```

**Installing Node.js**

After NVM has been installed, we'll want to install Node.js. Run the following:

```
$ nvm install v12.18.3
```

After running the above command, you should be able to verify that Node.js and NPM were successfully installed:

```
$ node -v
v12.18.3
$ npm -v
6.14.6
```

**Installing Yarn**

[Yarn](https://yarnpkg.com/) is a much faster dependency manager than NPM created by Facebook.

**We don't recommend installing Yarn via Homebrew as it will also install Node.js if you don't yet have it and you may run into conflicts with what we install via NVM.**

Install Yarn using the following command:

```
$ npm -g install yarn@1.22.4      // <= The version should match the version of yarn in the package.json file.
```

To verify the Yarn installation worked as expected, run the following commands:

```
$ which yarn
/Users/{yourUser}/.nvm/versions/node/v12.18.3/bin/yarn
$ yarn -v
1.22.4
```

### Setting Up Environment Variables

In order for the application to run successfully, you'll need to create some environment variables. We use [dotenv](https://github.com/motdotla/dotenv) to load in these values.

#### Server

Inside of a `server/.env` file, create the following variables (filled in with the appropriate values):

```
DB_SECRET = ''
PUSHER_APP_ID = ''
PUSHER_APP_KEY = ''
PUSHER_APP_SECRET = ''
```

#### Client

Inside of a `client/.env` file, create the following variables (filled in with the appropriate values):

```
API_BASE_URL = '/api'
APP_ENV = 'development'
NODE_ENV = 'development'
PUSHER_APP_KEY = ''
```

### Start Celebrity

After you've installed the dependencies, you can start running the project.

#### Server

The server is a collection of Netlify functions. We use `netlify-lambda` to run these for development.

To **run** the server, run the following commands:

```
$ cd server
$ yarn start
```

#### Client

For the client, we use `webpack-dev-server` to start a development server.

To **run** the client, run the following commands:

```
$ cd client
$ yarn start
```

The running development server will be at [http://localhost:9073](http://localhost:9073).

## Compilation

Celebrity uses [TypeScript](https://www.typescriptlang.org/docs/home.html) to compile its code.

To check for compilation errors from the command line, run:

```
$ yarn compile
```

**You don't have to install anything for this to work. TypeScript is a project dependency, which means it is installed anytime your other dependencies are installed (i.e. anytime `yarn` is run).**

## Code Formatting

Celebrity uses [Prettier](https://prettier.io/) (an opinionated code formatter) for automatic code formatting and [ESLint](https://eslint.org/) for lint checking. The formatting and linting happen as a Git precommit hook for any files that you currently have staged for commit. Prettier will modify your code files and re-add them to the Git commit. ESLint will likewise try to fix any issues it can and adds those changes as well.

**You don't have to install anything for this to work. Prettier is a dependency of Celebrity, which means it is installed anytime your other dependencies are installed (i.e. anytime `yarn` is run).**

## Deployment
