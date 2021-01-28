const jwt = require('jsonwebtoken');

exports.addJwtToCookie = (res, user) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		user: JSON.stringify({
			user_id: user.id,
			username: user.username,
			email: user.email,
			profile_image_url: user.profile_image_url	
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { httpOnly: true })
	res.setHeader('Content-Type', 'application/json');

	console.log("Adding JWT to cookie")
	console.log(res)

}

exports.addUserDetailsToCookie = (res, user) => {
	res.cookie('user', 
	JSON.stringify({
		user_id: user.id,
		username: user.username,
		email: user.email,
		profile_image_url: user.profile_image_url			
	}),
	{ // JSON response must be encoded as a string
		encode: String
	})
}

exports.refreshJwt = (res, decodedJwt) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 60),
		user: JSON.stringify({
			user_id: decodedJwt.user_id,
			username: decodedJwt.username,
			email: decodedJwt.email,
			profile_image_url: decodedJwt.profile_image_url		
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { httpOnly: true })
	res.setHeader('Content-Type', 'application/json');
}

exports.nullifyCookies = (res) => {
	res.cookie('jwt', "", { httpOnly: true })
	res.cookie('user', "", { encode: String })
}