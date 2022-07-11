// Consolidation of authentication logic
import bcrypt from 'bcrypt'
import passport from 'passport'
import LocalStrategy from 'passport-local'

export function initialize(passport, db) {

  // Setup credential checks
  passport.use(new LocalStrategy(
    { usernameField: 'name', passwordField: 'password' },
    // Check the validity of credentials
    async (username, password, callback) => {
      const query = `
        SELECT * 
        FROM account
        WHERE account_name = $1
      `
      const results = await db.query(query, [username])
      // No user found
      if (results.rows.length === 0) return callback(null, false)
      // Multiple possible users found - This should not happen
      else if (results.rows.length > 1) {
        throw new Error("Duplicate account names found")
      }
      // Found matching a user so check password
      else {
        const user = results.rows[0]
        const passwordHash = user["account_password_hash"]
        const match = await bcrypt.compare(password, passwordHash)
        if (match) return callback(null, user)
        else return callback(null, false)
      }
    }
  ))

  // Session serialization
  passport.serializeUser((user, callback) => {
    callback(null, user["account_id"])
  })
  passport.deserializeUser(async (id, callback) => {
    const query = `
      SELECT * 
      FROM account
      WHERE account_id = $1
    `
    const results = await db.query(query, [id])
    return callback(null, results.rows[0])
  })

}

// User registration
export async function registerUser(name, password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const query = `
    INSERT INTO account(account_name, account_password_hash) 
    VALUES ($1, $2) 
    RETURNING *
  `
  const result = await db.query(query, [name, hashedPassword])
  return result
}

// Authentication middleware
export function authenticate(config) {
  return passport.authenticate('local', config)
}

// Check middleware
export function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next()
  else res.redirect('/login')
}
export function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return res.redirect('/')
  else next()
}

