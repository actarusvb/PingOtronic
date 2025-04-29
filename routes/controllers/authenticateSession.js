
// const express = require('express');

authenticateSession = function  (req, res, next)  {
  console.log('Cookies: ', req.cookies.username)

	if (req.cookies.username) {
		console.log("Session Cookie is set %s",req.cookies.username)
		next();
	} else {
		console.log("No auth cookie found %o",req.cookies.username);
		res.render('loginPage',{
			title: "pingOtronic",
			header: "LoginPlease"
		});
	}
};

module.exports ={ authenticateSession};

