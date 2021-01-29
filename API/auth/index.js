const jwt = require('jsonwebtoken');

exports.addJwtToCookie = (res, user) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		user: JSON.stringify({
			user_id: user.id,
			username: user.username,
			email: user.email,
			profile_image_url: user.profile_image_url,
			domain: 'jacksonblair-react-crud-demo.com'
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { 
		httpOnly: true,
		sameSite: "none",
		secure: true
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.addUserDetailsToCookie = (res, user) => {
	res.cookie('user', 
	JSON.stringify({
		user_id: user.id,
		username: user.username,
		email: user.email,
		profile_image_url: user.profile_image_url,
		domain: 'jacksonblair-react-crud-demo.com'
	}),
	{ // JSON response must be encoded as a string
		encode: String,
		sameSite: "none",
		secure: true
	})
}

exports.refreshJwt = (res, decodedJwt) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		user: JSON.stringify({
			user_id: decodedJwt.user_id,
			username: decodedJwt.username,
			email: decodedJwt.email,
			profile_image_url: decodedJwt.profile_image_url,
			domain: 'jacksonblair-react-crud-demo.com'
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { 
		secure: true,
		httpOnly: true,
		sameSite: "none",
		domain: 'jacksonblair-react-crud-demo.com'
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.nullifyCookies = (res) => {
	res.cookie('jwt', "", { httpOnly: true })
	res.cookie('user', "", { encode: String })
}