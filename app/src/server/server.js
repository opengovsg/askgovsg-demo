// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import bodyParser from 'body-parser'
import express from 'express'
import url from 'url'
import path from "path"
import pg from 'pg'
import waitOn from 'wait-on'
import { Console } from 'console'

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
console.log(`Database ready at ${DB_HOST}:${DB_PORT}`)
// Setup the main application stack
const app = express()
// Find the path to the staic file folder
const filePath = url.fileURLToPath(import.meta.url)
const serverPath = path.dirname(filePath)
const publicPath = path.join(serverPath, "public")

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(bodyParser.json())
app.use(express.static(publicPath))

app.get("/", async (request, response) => {
  const result = await pool.query('SELECT * FROM account')
  response.send(result.rows)
});

app.get("/account", async (request, response) => {
  const result = await pool.query('SELECT * FROM account')
  response.send(result.rows)
});

app.post("/account", async (request, response) => {
  const name = request.body.name;
  const query = 'INSERT INTO account(name) VALUES ($1) RETURNING *'
  const result = await pool.query(query, [name]);
  response.send(result.rows)
});

// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))