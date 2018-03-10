/*jshint esversion: 6 */

let env = process.env.NODE_ENV || 'development';
console.log('env *****', env);

if (env === 'development') {
  let config = require('./config.json');
  let envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

module.exports = {
    jwtSecret: '',
    jwtSession: {
      session: false
    },
    'secret' : process.env.JWT_SECRET,
    'mongoUrl' : process.env.MONGODB_URI
};
// To start mongo on Windows - "C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe"

/*
let env ... if Node is running on my machine, it automatically chooses 'development'(?)
If we're on Heroku, Heroku sets env to process.env.NODE_ENV

Then, if env === development, we set envConfig to equal the keys in confog.json,
which we don't push to github. Then we assign each process.env key to each of
the keys in config.json (JWT_SECRET, MONGODB_URI).

Then, when we export the module, the secret and the mongoUrl are set
from the env var either in config.json or on the Heroku server, which are
different from the local ones.
*/
