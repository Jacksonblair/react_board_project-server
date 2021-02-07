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
	res.cookie('jwt', token, { 
		httpOnly: true,
		sameSite: process.env.DEVELOPMENT ? null : "none",
		secure: process.env.DEVELOPMENT ? false : true
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.addUserDetailsToCustomHeader = (res, user) => {
	res.set('X-User', JSON.stringify({
		user_id: user.id ? user.id : user.user_id,
		username: user.username,
		email: user.email,
		profile_image_url: user.profile_image_url
	}))
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
	res.cookie('jwt', token, { 
		secure: process.env.DEVELOPMENT ? false : true,
		httpOnly: true,
		sameSite: process.env.DEVELOPMENT ? null : "none",
	})
	res.setHeader('Content-Type', 'application/json');
}

exports.nullifyCookies = (res) => {
	res.cookie('jwt', "", { 
		httpOnly: true, 
		secure: process.env.DEVELOPMENT ? false : true,
		sameSite: process.env.DEVELOPMENT ? null : "none",
	})
	res.set('X-User', JSON.stringify({
		user_id: null,
		username: null,
		email: null,
		profile_image_url: null
	}))
}