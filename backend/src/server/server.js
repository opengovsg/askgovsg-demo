// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import express from 'express';
import url from 'url';
import path from "path";
// -----------------------------------------------------------------------------
// Environmental Variables && Constants
// -----------------------------------------------------------------------------
const PORT = process.env.PORT ? process.env.PORT : 1337;

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
// Setup the main application stack
const app = express();
app.use
// Find the path to the staic file folder
const filePath = url.fileURLToPath(import.meta.url);
const serverPath = path.dirname(filePath);
const publicPath = path.join(serverPath, "public"); 

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(express.static(publicPath));

app.get("/:route", (request, response) => {
  response.send(`postgres-node-dev-template: server.js ${request.params.route}`);
});

// -----------------------------------------------------------------------------
// Postgres testing stuff
// -----------------------------------------------------------------------------
import pg from 'pg'
const client = new pg.Client({
  user: 'postgres',
  host: 'database',
  database: 'postgres',
  password: 'postgres',
  port: 5432
})
await client.connect()
const res = await client.query('SELECT $1::text as message', ['Hello world!'])
console.log(res.rows[0].message) // Hello world!
await client.end()

// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));