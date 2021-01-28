const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

module.exports = {
	query: (text, params, callback) => {
		const start = Date.now()
		return pool.query(text, params, (err, res) => {
			if (err) {
				console.log(err.message)
			} else {
				const duration = Date.now() - start
				console.log('executed query', { text, duration, rows: res.rowCount })
			}
			callback(err, res)
		})
	},
	getClient: (callback) => {
		pool.connect((err, client, done) => {

			console.log(err)
			console.log(client)
			console.log(done)

			const query = client.query
			// monkey patch the query method to keep track of the last query executed
			client.query = (...args) => {
				client.lastQuery = args
				return query.apply(client, args)
			}

			// set a timeout of 5 seconds, after which we will log this client's last query
			const timeout = setTimeout(() => {
				console.error('A client has been checked out for more than 5 seconds!')
				console.error(`The last executed query on this client was: ${client.lastQuery}`)
			}, 5000)
			const release = (err) => {
				console.log(err)
				// call the actual 'done' method, returning this client to the pool
				done(err)
				// clear our timeout
				clearTimeout(timeout)
				// set the query method back to its old un-monkey-patched version
				client.query = query
			}
			callback(err, client, release)
		})
	}
}



/*CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	board_id INT REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
	title VARCHAR(100) NOT NULL,
	content VARCHAR(5000) NOT NULL,
	target_date TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	created_by_user_id INT REFERENCES users(id) NOT NULL 
);

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_user_id INT REFERENCES users(id) NOT NULL
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(100) NOT NULL,
	username VARCHAR(20) NOT NULL DEFAULT 'Username'
	password_hash VARCHAR(100) NOT NULL
)

*/

// Database creation queries

// CREATE OR REPLACE FUNCTION trigger_set_timestamp()
// RETURNS TRIGGER AS $$
// BEGIN
//   NEW.updated_at = NOW();
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// CREATE TABLE users (
// 	id VARCHAR(25) PRIMARY KEY NOT NULL,
// 	display_name VARCHAR(32) NOT NULL,
//  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );


// CREATE TABLE scores (
// 	user_id VARCHAR(25) REFERENCES users(id) NOT NULL,
// 	channel_id INT REFERENCES channels(id) NOT NULL,
// 	score INT DEFAULT 1000 NOT NULL,
// 	display_name VARCHAR(32),
// 	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
// 	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

// CREATE TABLE channels (
// 	id INT PRIMARY KEY NOT NULL,
// 	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

// CREATE TRIGGER set_timestamp
// BEFORE UPDATE ON scores
// FOR EACH ROW
// EXECUTE PROCEDURE trigger_set_timestamp();

// CREATE TABLE transactions (
// 	id VARCHAR(50) PRIMARY KEY,
// 	data JSON NOT NULL,
// 	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// 	)

// INSERT INTO users (name, password) VALUES ('deadeye', 'test') ON CONFLICT DO NOTHING/UPDATE;
// RETURN row_to_json(row) FROM (SELECT name, password FROM users WHERE name = 'deadeye') row;