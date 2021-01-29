const jwt = require('jsonwebtoken');

exports.addJwtToCookie = (res, user) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 1),
		user: JSON.stringify({
			user_id: user.user_id,
			username: user.username,
			email: user.email,
			profile_image_url: user.profile_image_url
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { 
		httpOnly: true,
		sameSite: "none",
		secure: true
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.addUserDetailsToCustomHeader = (res, user) => {
	res.set('X-User', JSON.stringify({
		user_id: user.user_id,
		username: user.username,
		email: user.email,
		profile_image_url: user.profile_image_url
	}))
}

exports.refreshJwt = (res, decodedJwt) => {
	let token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + (60 * 1),
		user: JSON.stringify({
			user_id: decodedJwt.user_id,
			username: decodedJwt.username,
			email: decodedJwt.email,
			profile_image_url: decodedJwt.profile_image_url
		})
	}, process.env.SECRET)
	res.cookie('jwt', token, { 
		secure: true,
		httpOnly: true,
		sameSite: "none"
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.nullifyCookies = (res) => {
	res.cookie('jwt', "", { httpOnly: true })
	res.set('X-User', JSON.stringify({
		user_id: null,
		username: null,
		email: null,
		profile_image_url: null
	}))
}