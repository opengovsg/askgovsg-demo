// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import bcrypt from 'bcrypt'
import express from 'express'
import flash from 'express-flash'
import session from 'express-session'
import url from 'url'
import passport from 'passport'
import LocalStrategy from 'passport-local'
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
app.use(flash())
app.use(session({ 
  secret: 'keyboard cat', 
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password',
  }, async (username, password, callback) => {
    const query = `
      SELECT * 
      FROM account
      WHERE account_name = $1
    `
    const results = await pool.query(query, [username])
    if (results.rows.length < 1) return callback(null, false)
    else {
      const user = results.rows[0]
      const passwordHash = user["account_password_hash"];
      const match = await bcrypt.compare(password, passwordHash)
      if (match) return callback(null, user)
      else return callback(null, false)
    }
  }
))
passport.serializeUser((user, callback) => callback(null, user["account_id"]))
passport.deserializeUser(async (id, callback) => {
  const query = `
    SELECT * 
    FROM account
    WHERE account_id = $1
  `
  const results = await pool.query(query, [id])
  return callback(null, results.rows[0])
})
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(express.static(publicPath))

app.get("/", async (req, res) => {
  const results = []
  results.push(...(await pool.query('SELECT * FROM account')).rows)
  results.push(...(await pool.query('SELECT * FROM post')).rows)
  res.render('index', { results })
})

app.get("/account", checkAuthenticated, async (req, res) => {
  const results = (await pool.query('SELECT * FROM account')).rows
  res.render('account', { results })
})

app.get("/post", checkAuthenticated, async (req, res) => {
  const results = (await pool.query('SELECT * FROM post')).rows
  res.render('post', { results })
})

app.post("/post", checkAuthenticated, async (req, res) => {
  const owner = req.body.owner
  const description = req.body.description
  const query = 'INSERT INTO post(post_owner_id, post_description) VALUES ($1, $2) RETURNING *'
  const result = await pool.query(query, [owner, description])
  res.send(result.rows)
})

app.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render('register')
})

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const query = `
    INSERT INTO account(account_name, account_password_hash) 
    VALUES ($1, $2) 
    RETURNING *
  `
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const result = await pool.query(query, [req.body.name, hashedPassword])
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.get("/login", checkNotAuthenticated, async (req, res) => {
  res.render('login')
})

app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}))

app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err) }
    res.redirect('/')
  })
})


// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))