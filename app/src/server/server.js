// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import express from 'express'
import url from 'url'
import path from "path"
import pg from 'pg'
import waitOn from 'wait-on'

// -----------------------------------------------------------------------------
// Environmental Variables && Constants
// -----------------------------------------------------------------------------
const PORT = process.env.PORT ? process.env.PORT : 1337
const DB_HOST = process.env.DB_HOST ? process.env.DB_HOST : "db"
const DB_PORT = process.env.DB_PORT ? process.env.DB_PORT : 5432
const DB_NAME = process.env.DB_NAME ? process.env.DB_NAME : "postgres"
const DB_USER = process.env.DB_USER ? process.env.DB_USER : "postgres"
const DB_PASSWORD = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : "postgres"

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
// Setup the database connection
const pool = new pg.Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
})
await waitOn({ 
  resources: [`tcp:${DB_HOST}:${DB_PORT}`] 
})
// Setup the main application stack
const app = express()
// Find the path to the staic file folder
const filePath = url.fileURLToPath(import.meta.url)
const serverPath = path.dirname(filePath)
const publicPath = path.join(serverPath, "public")

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(express.static(publicPath))

app.get("/:route", async (request, response) => {
  const result = await pool.query('SELECT $1::text as message', [`Hello ${request.params.route}!`])
  response.send(`postgres-node-dev-template: server.js ${result.rows[0].message}`)
});

// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))