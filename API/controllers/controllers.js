const db = require('../../db/index.js')
const auth = require('../auth/index.js')
const queries = require('../../db/queries.js')
const bcrypt = require('bcryptjs')
const saltRounds = 10;
const errorMessages = {
	default: "Server error"
}

exports.updateEmail = (req, res) => {
	if (req.user) {
		if (req.user.email == "guest@live.com") {
			res.status(403).send("You cannot edit the guest account")
		} else if (emailIsValid(req.body.email)) { // Check if the email is of a valid format
			db.getClient((err, client, release) => {
				client.query(queries.GET_USER_BY_EMAIL, [req.body.email], (err, _res) => {
					if (err) {
						res.status(403).send(errorMessages.default)
						release(err)
					} else if (_res.rows[0]) {
						res.status(403).send("Email already in use")
						release()
					} else {
						// If email not already in use
						client.query(queries.UPDATE_USER_EMAIL_BY_USER_ID, [req.body.email, req.user.user_id], (err, _res) => {
							if (err) {
								res.status(403).send(errorMessages.default)
								release(err)
							} else if (_res.rows[0]) {
								auth.addJwtToCookie(res, _res.rows[0])
								auth.addUserDetailsToCustomHeader(res, _res.rows[0])
								res.status(200).send("Updated email")
								release()			
							} else {
								res.status(403).send("Could not update email")		
								release()			
							}
						})
					}
				})
			})
		} else {
			res.status(403).send("Email is not valid")			
		}
	} else {
		res.status(403).send("User is not logged in")
	}

}

exports.updatePassword = (req, res) => {
	if (req.user) {
		if (req.user.user_id == process.env.GUEST_ACCOUNT_ID) {
			res.status(403).send("You cannot edit the guest account")
		} else if (req.body.newPassword == req.body.oldPassword) { // Check for form error first
			res.status(403).send("New password cannot be the same as old password")
		// if that's all good, grab a client and verify user password against password hash in db
		} else {
			db.getClient((err, client, release) => {
				client.query(queries.GET_USER_BY_USER_ID, [req.user.user_id], (err, _res) => {
					if (err) {
						res.status(403).send(errorMessages.default)
						release(err)
					} else if (_res.rows[0]) {
						bcrypt.compare(req.body.oldPassword, _res.rows[0].password_hash, function(err, result) {
						    if (result == true) { 
						    	// If the passwords match, we hash the new password
								bcrypt.hash(req.body.newPassword, saltRounds, function(err, hash) {
									if (err) {
										res.status(403).send(errorMessages.default)
										release(err)
									} else {
										db.query(queries.UPDATE_USER_PASSWORD_BY_USER_ID, [hash, req.user.user_id], (err, _res) => {
											if (err) {
												res.status(403).send(errorMessages.default)
											} else if (_res.rows[0]) {
												res.status(200).send("Updated password")
											} else {
												res.status(403).send("Could not update password")
											}
											release()
										})
									}
								})  
						    } else { // old password is incorrect
								res.status(403).send("Old password is incorrect")
								release()
						    }
						})
					} else {
						res.status(403).send("User does not exist")
						release()
					}
				})
			})
		}
	} else {
		res.status(403).send("User is not logged in")
	}
}

exports.updateBoard = (req, res) => {
	if (req.user) {
		db.getClient((err, client, release) => {
			client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
				if (err) {
					res.status(403).send(errorMessages.default)
					release(err)
				} else if (_res.rows[0]) {
					if (_res.rows[0].created_by_user_id == req.user.user_id) {

						client.query(queries.UPDATE_BOARD_BY_BOARD_ID, [req.body.name, req.body.description, req.body.public, req.params.boardid], (err, _res) => {
							if (err) {
								res.status(403).send(errorMessages.default)
								release(err)
							} else if (_res.rows[0]) {
								res.status(200).send("Updated board")
								release()
							} else {
								res.status(403).send("Could not update board")
								release()
							}
						})
					} else {
						res.status(403).send("You cannot update this board")
						release()
					}
				} else {
					res.status(403).send("Board does not exist")					
					release()
				}
			})
		})
	} else {
		res.status(403).send("User is not logged in")
	}
}

exports.updatePost = (req, res) => {

	/*
		This route is called when a user tries to update a post
		We check write access, and update if its OK
	*/

	if (req.user) {
		db.getClient((err, client, release) => {
			client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
				if (err) {
					res.status(403).send(errorMessages.default)
					release(err)
				} else if (_res.rows[0]) {
					if (_res.rows[0].created_by_user_id == req.user.user_id) {
						client.query(queries.UPDATE_POST_BY_POST_ID, [req.body.title, req.body.content, req.body.target_date, req.params.postid], (err, _res) => {
							if (err) {
								res.status(403).send(errorMessages.default)
								release(err)
							} else if (_res.rows[0]) {
								res.status(200).send("Updated post")
								release()
							} else {
								res.status(403).send("Could not update post")
								release()
							}
						})
					} else {
						res.status(403).send("You cannot update this post")
						release()
					}
				} else {
					res.status(403).send("Board does not exist")					
					release()
				}
			})
		})
	} else {
		res.status(403).send("User is not logged in")
	}

}

exports.deletePost = (req, res) => {

	/* 
		This route is called when a user tries to delete a post
		We check write access, and delete if its OK
	*/

	if (req.user) {
		db.getClient((err, client, release) => {
			// - If user created the board
			client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
				if (err) {
					res.status(403).send(errorMessages.default)
					release(err)
				} else if (_res.rows[0]) {
					if (_res.rows[0].created_by_user_id == req.user.user_id) {
						client.query(queries.DELETE_POST_BY_POST_ID, [req.params.postid], (err, _res) => {
							if (err) {
								res.status(403).send(errorMessages.default)
								release(err)
							} else if (_res.rows[0]) {
								res.status(200).send("Deleted post")
								release()
							} else {
								res.status(403).send("Could not delete post")
								release()
							}
						})
					} else {
						res.status(403).send("You cannot delete this post")
						release()
					}
				} else {
					res.status(403).send("Board does not exist")					
					release()
				}
			})
		})
	} else {
		res.status(403).send("User is not logged in")
	}

}

exports.getPost = (req, res) => {
	/*
		This route is called when a user tries to read a single post
		We have to check if they access to the board AND the post
	*/

	db.getClient((err, client, release) => {
		client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
			if (err) {
				res.status(403).send(errorMessages.default)
				release(err)
			} else if (_res.rows[0]) {
				if (_res.rows[0].public || req.user.user_id == _res.rows[0].created_by_user_id) {
					client.query(queries.GET_POST_BY_POST_ID, [req.params.postid], (err, _res) => {
						if (err) {
							res.status(403).send(errorMessages.default)
							release(err)
						} else if (_res.rows[0]) {
							res.status(200).send({ post: _res.rows[0] })
							release()
						} else {
							res.status(403).send("Post does not exist")
							release()
						}
					})
				} else {
					res.status(403).send("You cannot view this post")
					release()
				}
			} else {
				res.status(403).send("Board does not exist")
				release()
			}
		})
	})
}

exports.newPost = (req, res) => {
	/*
		This route is called when a user tries to create a new post
		First we check if the user has write access for that board
		Then we add the post
	*/

	if (req.user) {
		db.getClient((err, client, release) => {
			client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
				if (err) {
					res.status(403).send(errorMessages.default)
					release(err)
				} else if (_res.rows[0]) {
					// - If user created the board
					if (_res.rows[0].created_by_user_id == req.user.user_id) {
						if (req.body.title.length < 1) {
							res.status(403).send("Post must have a title")
							release()
						} else if (req.body.content.length < 1) {
							res.status(403).send("Post must have content")		
							release()
						} else {
							client.query(queries.ADD_NEW_POST, [req.body.title, req.body.content, req.body.target_date, req.user.user_id, _res.rows[0].id], (err, _res) => {
								if (err) {
									res.status(403).send(errorMessages.default)
									release(err)
								} else {
									res.status(200).send("Added new post")
									release()						
								}
							})		
						}
					} else {
						res.status(403).send("You cannot add a post to this board")
						release()
					}
				} else {
					res.status(403).send("Board does not exist")					
					release()
				}
			})
		})
	} else {
		res.status(403).send("User is not logged in")
	}
}

exports.deleteBoard = (req, res) => {
	/* 
		This route is called when a user tries to delete a board
		We check write access, and delete if its OK
	*/

	db.getClient((err, client, release) => {
		client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
			if (err) {
				res.status(403).send(errorMessages.default)
				release(err)
			} else if (_res.rows[0]) {
				if (_res.rows[0].created_by_user_id == req.user.user_id) {
					client.query(queries.DELETE_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {
						if (err) {
							res.status(403).send(errorMessages.default)
							release(err)
						} else if (_res.rows[0]) {
							res.status(200).send("Deleted board")
							release()
						} else {
							res.status(403).send("Could not delete board")
							release()
						}
					})
				} else {
					res.status(403).send("You cannot delete this board")
					release()
				}
			} else {
				res.status(403).send("Board does not exist")
				release()
			}
		})
	})
}

exports.newBoard = (req, res) => {
	/*
		This route is called when a user tries to create a new board
	*/

	if (req.user) {
		if (req.body.name < 1) {
			res.status(403).send("Board must have a name")
		} else if (req.body.description < 1) {
			res.status(403).send("Board must have a description")
		} else {
			db.query(queries.ADD_NEW_BOARD, [req.body.name, req.body.description, req.body.public, req.user.user_id, req.user.username], (err, _res) => {
				if (err) {
					res.status(403).send(errorMessages.default)
				} else {
					res.status(200).send("Added new board")
				}
			})			
		}
	} else {
		res.status(403).send("User is not logged in")
	}
}

exports.getBoards = (req, res) => {
	/*
		If the request is from an authed user, we try and get boards available to them,
		..and send them back to the client
	*/

	if (req.user) {
		db.query(queries.GET_BOARDS_BY_USER_ID, [req.user.user_id], (err, _res) => {
			if (err){
				res.status(403).send(errorMessages.default)
			} else {
				res.status(200).send({ boards: _res.rows[0] ?  _res.rows : [] })
			}
		})	
	} else {
		res.status(403).send("User is not logged in")
	}
}

exports.getBoard = (req, res) => {
	/*
		This is a request to view a board + it's contents
		We need to check the permissions of the board (public, owned by whom, etc)
		And if the user can view it, we need to get all the posts for that board.
	*/

	db.getClient((err, client, release) => {
		client.query(queries.GET_BOARD_BY_BOARD_ID, [req.params.boardid], (err, _res) => {

			let canView = false

			if (err) {
				res.status(403).send(errorMessages.default)
				release(err)
			} else if (_res.rows[0]) {

				/* Check board permissions */
				// if board is public
				if (_res.rows[0].public) { 
					canView = true
				// Else if the user created the board (check if there is a user first)
				} else if (req.user && _res.rows[0].created_by_user_id == req.user.user_id) { 
					canView = true
				} else { 
					// assuming user does not have access
					res.status(403).send("You do not have access to this board")					
				}

				// If we can view the board, get the posts for that board. 
				if (canView) {
					client.query(queries.GET_POSTS_BY_BOARD_ID, [_res.rows[0].id], (err, __res) => {
						if (err) {
							console.log(err)
							res.status(403).send(errorMessages.default)
							release(err)
						} else {
							console.log(__res.rows)
							res.status(200).send({ board: _res.rows[0], posts: __res.rows[0] ? __res.rows : [] })
							release()
						}
					})
				}

			} else {
				res.status(403).send("Board does not exist")
				release()
			}

		})

	})

}

exports.getHome = (req, res) => {
	/*
		When an app wants a users 'home' page
		Which includes the boards that are available to them
		+ a list of activity for those boards
	*/

	if (req.user) {
		db.query(queries.GET_BOARDS_BY_USER_ID, [req.user.user_id], (err, _res) => {
			if (err) {
				res.status(403).send(errorMessages.default)
			} else {
				res.status(200).send(_res.rows[0] ? _res.rows : [])
			}
		})
	} else {
		res.status(403).send("You are not logged in")
	}
}

exports.getProfile = (req, res) => {
	/*
		When a app user wants a user profile
		We check the read access for that user profile,
		and if its public, we send it back
	*/

	if (req.user) {
		db.query(queries.GET_USER_BY_USER_ID, [req.params.userid], (err, _res) => {
			if (err) {
				res.status(403).send(errorMessages.default)
			} else if (_res.rows[0]) {
				res.status(200).json({
					id: _res.rows[0].id,
					email: _res.rows[0].email,
					username: _res.rows[0].username,
					profile_image_url: ""
				})
			} else {
				res.status(403).send("User does not exist")				
			}
		})
	} else {
		res.status(403).send("Logged out users cannot view a profile")
	}

}

exports.logout = (req, res) => {
	auth.nullifyCookies(res)
	res.status(200).send("Logged user out")
}

exports.login = (req, res) => {
	/*
		We get the email and password here.

		We verify that the email is a valid string

		We check the details against the database
			- Compare password to decoded password hash
		If they match
			- Generate a JWT, chuck in httpOnly cookies
			- And send back a success code
	*/
	if (!req.user) {
		db.query(queries.GET_USER_BY_EMAIL, [req.body.email], (err, _res) => {
			if (err) {
				res.status(403).send(errorMessages.default)
			} else if (_res.rows[0]) { // If found a match in db
				// Check if password matches hash
				bcrypt.compare(req.body.password, _res.rows[0].password_hash, function(err, result) {
				    if (result == true) { // password is correct for that email

				    	// Add JWT to cookies
				    	auth.addJwtToCookie(res, _res.rows[0])
				    	// Add user details to cookies (id, email, profile image url)
				    	auth.addUserDetailsToCustomHeader(res, _res.rows[0])

				    	// Send back to client
				    	res.status(200).send("Logged user in")

				    } else { // password is incorrect
						res.status(403).send("Invalid user credentials")
				    }
				});
			} else { // If didn't find a match in db
				res.status(403).send("User does not exist")
			}
		})
	} else {
		res.status(403).send("User is already logged in")
	}

}

exports.register = (req, res) => {

	/*
		We get the users registration details
		We verify that they are valid
		And that a user by that email does not already exist
	*/

	if (!emailIsValid(req.body.email)) {
		res.status(403).send("Invalid email")
	} else if (!usernameIsValid(req.body.username)) {
		res.status(403).send("Invalid username")
	} else {
		// Check database for existing user with this email
		db.getClient((err, client, release) => { // Multiple queries, so we grab client
			if (err) { // Cant get client, send error response
				release(err)
				res.status(403).send(errorMessages.default)
			} else {
				client.query(queries.GET_USER_BY_EMAIL, [req.body.email], (err, _res) => {
					if (err) { // Db error, send error response
						release(err)
						res.status(403).send(errorMessages.default)
						return
					} 
					if (_res.rows[0]) { // User already exists, send error response
						res.status(403).send("User already exists")
						release()
					} else { // No existing user with these details, so we can make a new one
						// Hash the password
						bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
							client.query(queries.ADD_NEW_USER, [req.body.email, req.body.username, hash], (err) => {
								if (err) {
									res.status(403).send(errorMessages.default)
									release(err)
								} else {
									res.status(200).send("Added new user")
									release()
								}
							})
						})
					}
				})
			}
		})
	}

}

emailIsValid = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

usernameIsValid = (username) => {
	let regex = /^[a-zA-Z\-]+$/;
    return (regex.test(String(username)) && username.length <= 20);
}