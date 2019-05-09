# Polling application
Polling application built using Node.js, TS, Websockets, and MongoDB

### Environment variables
These can be set either by filling out the config/credentials` file or setting them as environment variables, e.g. process.env.BASE_URL=myurl

The following options are avaible:
| Variable | Description |
|---|---|
| NODE_ENV (only available as env var) | The environemnt your application is running in |
| baseUrl | The url your application runs on |
| wrUrl | The url of the websocket server |
| mailerEmail | Email address used by node mailer |
| mailerPasswrod | Password for mailer email address |
| databaseUrl | Mongo uri connection string |
| passportSecret | Secret used by passport |

### Setup
* Run `npm i`
* Run `npm run serve:frontend` & `npm run serve:server` to begin development server (http://localhost:3001/)

