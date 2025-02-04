 # Math Meridio Client
 

Project Requirements:

- [Make](https://askubuntu.com/questions/161104/how-do-i-install-make)
- [nvm](https://github.com/nvm-sh/nvm) (to manage node versions)
- node version 18.17.1 (
    - verify using $ node --version 

## Local Development:

Required: Create a `.env.development` file in the root directory that contains the required environment variables.

1. Start the local server:
```
$ npm ci
$ make develop
```
2. Visit: http://localhost:3001/

## Integration Testing:
We use [Cypress](https://www.cypress.io/) for integration tests.
- Open 2 terminals
- In terminal 1: $ make develop
- In terminal 2: $ make cypress
- Cypress will open in separate window

## Pushing code changes

- Before pushing your changes to github, run `make format` and `make test-all` to confirm all tests pass.
- ALWAYS push your changes to a separate branch and open a PR when your changes are ready to be reviewed.
- Request a review from a team member.
- Once the PR is approved, merge into main.
