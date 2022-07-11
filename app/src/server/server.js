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
console.log(`Database ready at ${DB_HOST}:${DB_PORT}`)
// Setup the main application stack
const app = express()
// Find the path to the staic file folder
const filePath = url.fileURLToPath(import.meta.url)
const serverPath = path.dirname(filePath)
const viewPath = path.join(serverPath, "views")
const publicPath = path.join(serverPath, "public")
// Configure middleware
app.set('view engine', 'pug')
app.set('views', viewPath)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(express.static(publicPath))

app.get("/", async (request, response) => {
  const results = []
  results.push(...(await pool.query('SELECT * FROM account')).rows)
  results.push(...(await pool.query('SELECT * FROM post')).rows)
  response.render('index', { results })
})

app.get("/account", async (request, response) => {
  const results = (await pool.query('SELECT * FROM account')).rows
  response.render('account', { results })
})

app.post("/account", async (request, response) => {
  const name = request.body.name
  const query = 'INSERT INTO account(account_name) VALUES ($1) RETURNING *'
  const result = await pool.query(query, [name])
  response.send(result.rows)
})

app.get("/post", async (request, response) => {
  const results = (await pool.query('SELECT * FROM post')).rows
  response.render('post', { results })
})

app.post("/post", async (request, response) => {
  const owner = request.body.owner
  const description = request.body.description
  const query = 'INSERT INTO post(post_owner_id, post_description) VALUES ($1, $2) RETURNING *'
  const result = await pool.query(query, [owner, description])
  response.send(result.rows)
})

app.get("/login", async (request, response) => {
  response.render('login')
})

app.post("/login", async (request, response) => {
  console.log("logging in", request.body.name, request.body.password)
  response.send("done")
})

app.get("/register", async (request, response) => {
  response.render('register')
})

app.post("/register", async (request, response) => {
  console.log("registering", request.body.name, request.body.password)
  response.send("done")
})


// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))