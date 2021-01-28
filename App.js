require('dotenv').config()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = require('express')()
const auth = require('./API/auth/index.js')
const routes = require('./API/routes/routes')

// cors policy
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://jackson-blair-react-crud-demo.herokuapp.com")
	res.header('Access-Control-Allow-Credentials', true)	
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
	res.header('Access-Control-Max-Age', "86400")
	next()
})

app.use(cookieParser())
// parse application/json
app.use(bodyParser.json())

// Function for checking auth status
app.use((req, res, next) => {

	/*
		Very basic auth.

		Every time a request is made, we check the users auth 
		If their token is valid
		- We refresh it (with a 1h expiry)
		- We set req.auth to tell the next function they're authed

		If their token is invalid (or doesnt exist)
		- We do nothing, protected resource access functions will check the state of req.auth
	*/

	if (req.cookies.jwt) {
		jwt.verify(req.cookies.jwt, process.env.SECRET, (err, decodedJwt) => {
			if (err) {
				console.log("Jwt could not be decoded")
				// If the JWT is invalid we nullify it and the user details
				auth.nullifyCookies(res)
			} else {
				console.log("Jwt was decoded")
				console.log(decodedJwt)

				// if token is still valid, refresh it
				if (decodedJwt.exp * 1000 > Date.now()) {
					console.log("Refreshing token")
					auth.refreshJwt(res, JSON.parse(decodedJwt.user))
					req.user = JSON.parse(decodedJwt.user)
				} else {
					// if its expired, nullify cookies
					auth.nullifyCookies(res)
				}
			}
		})
	}

	next()
})

app.use('/api', routes);

// Server listen
app.listen(process.env.PORT || 5000, () => {
	console.log(`Listening on ${process.env.PORT || 5000}`)
});

module.exports = app;