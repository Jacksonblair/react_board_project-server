const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');
const mw = require('../middleware/middleware')


/* GET routes */

// Get home contents
router.get('/home', controllers.getHome)

// Get list of available boards 
router.get('/boards', controllers.getBoards)

// Get a single board + the posts for that board
router.get('/board/:boardid/', controllers.getBoard)

router.get('/profile/:userid/', controllers.getProfile)

// Get a post
router.get('/board/:boardid/post/:postid', controllers.getPost)



/* POST routes */

router.post('/login', controllers.login)

router.post('/logout', controllers.logout)

router.post('/register', controllers.register)

router.post('/board/new', controllers.newBoard)

router.post('/board/:boardid/post/new', controllers.newPost)


/* DELETE routes */

router.delete('/board/:boardid', controllers.deleteBoard)

router.delete('/board/:boardid/post/:postid', controllers.deletePost)


/* PUT routes */

router.put('/board/:boardid/post/:postid', controllers.updatePost)

router.put('/board/:boardid', controllers.updateBoard)

router.put('/auth/email', controllers.updateEmail)

router.put('/auth/password', controllers.updatePassword)

/* Preflight */

router.options('/*', (req, res) => {
	res.header('Access-Control-Allow-Origin', 'https://jackson-blair-react-crud-demo.herokuapp.com/');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	res.send(200);
})

module.exports = router;