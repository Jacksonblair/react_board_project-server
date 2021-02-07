exports.GET_USER_BY_EMAIL = "SELECT * FROM users WHERE email = $1"
exports.GET_USER_BY_ID = "SELECT * FROM users WHERE id = $1"
exports.ADD_NEW_USER = "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)"
exports.GET_BOARDS_BY_USER_ID = "SELECT * FROM boards WHERE created_by_user_id = $1"
exports.ADD_NEW_BOARD = "INSERT INTO boards (name, description, public, created_by_user_id, created_by_username) VALUES ($1, $2, $3, $4, $5)"
exports.GET_BOARD_BY_BOARD_ID = "SELECT * FROM boards WHERE id = $1"

exports.GET_POSTS_BY_BOARD_ID = `SELECT id, board_id, created_at, created_by_user_id, title, content, 
 								target_date as _target_date,
								to_char(created_at, 'DD/MM/YYYY') AS created_date,
								to_char(created_at, 'TZ') AS created_timezone,
								to_char(target_date, 'DD/MM/YYYY') AS target_date,
								to_char(target_date, 'TZ') AS target_timezone
								FROM posts WHERE board_id = $1 ORDER BY _target_date DESC`
exports.GET_POST_BY_POST_ID = `SELECT id, board_id, created_at, created_by_user_id, title, content,
								target_date as _target_date,
								to_char(created_at, 'DD/MM/YYYY') AS created_date,
								to_char(created_at, 'TZ') AS created_timezone,
								to_char(target_date, 'DD/MM/YYYY') AS target_date,
								to_char(target_date, 'TZ') AS target_timezone
								FROM posts WHERE id = $1`

exports.ADD_NEW_POST = "INSERT INTO posts (title, content, target_date, created_by_user_id, board_id) VALUES ($1, $2, TO_DATE($3, 'dd/mm/yyyy'), $4, $5)"

exports.DELETE_POST_BY_POST_ID = "DELETE FROM posts WHERE id = $1 RETURNING *"
exports.DELETE_BOARD_BY_BOARD_ID = "DELETE FROM boards WHERE id = $1 RETURNING *"
exports.UPDATE_POST_BY_POST_ID = "UPDATE posts SET title = $1, content = $2, target_date = TO_DATE($3, 'dd/mm/yyyy') WHERE id = $4 RETURNING *"
exports.UPDATE_BOARD_BY_BOARD_ID = "UPDATE boards SET name = $1, description = $2, public = $3 WHERE id = $4 RETURNING *"
exports.GET_USER_BY_USER_ID = "SELECT * FROM users WHERE id = $1"
exports.UPDATE_USER_EMAIL_BY_USER_ID = "UPDATE users SET email = $1 WHERE id = $2 RETURNING *"
exports.UPDATE_USER_PASSWORD_BY_USER_ID = "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *"
exports.CLEAR_GUEST_BOARD_DATA = `DELETE FROM boards WHERE created_by_user_id = ${process.env.GUEST_ACCOUNT_ID}`

