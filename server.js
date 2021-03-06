/* eslint-disable no-console */

const express = require('express');
//server will listen to port number given by heroku or 8080
const DEFAULT_PORT = process.env.PORT || 8080;
const port = parseInt(process.argv[2]) || DEFAULT_PORT;

const app = express();

// Serve static files relative to the project root.
app.use(express.static('./'));
app.listen(port, () => console.log(`server listening on port ${port}`));
