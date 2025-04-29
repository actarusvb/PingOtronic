//
// authorization middleware
//

authenticateSession = ( scope ) => (req, res, next) => {
	console.log("Cookies:%s isAdmin %s manageHosts %s scope >%s<", req.signedCookies.username,req.signedCookies.isAdmin,req.signedCookies.manageHosts,scope)
	if (req.signedCookies.username){ 
		switch(scope){
			case "read" :
				console.log("A Session Cookie is set %s |Sc >%s|Adm >%s|host >%s<",req.signedCookies.username,scope,req.signedCookies.isAdmin,req.signedCookies.manageHosts)
				next();
				break;
			case "manageHosts" :
				if(req.signedCookies.manageHosts === "true"){
					console.log("B Session Cookie is set %s |Sc >%s|Adm >%s|host >%s<",req.signedCookies.username,scope,req.signedCookies.isAdmin,req.signedCookies.manageHosts)
					next();
					break;
				}else{
					console.log("B Auth not set",req.signedCookies.manageHosts);
				}
			case "isAdmin":
				if(req.signedCookies.isAdmin === "true"){
					console.log("C Session Cookie is set %s |Sc >%s|Adm >%s|host >%s<",req.signedCookies.username,scope,req.signedCookies.isAdmin,req.signedCookies.manageHosts)
					next();
					break;
				}else{
					console.log("C Auth not set",req.signedCookies.isAdmin);
				}
			default:		
				console.log("D No auth cookie found %o",req.signedCookies.username);
				console.log("Wrong authorization for  %s %s",req.signedCookies.username,scope);
				res.redirect("/");
		}
	}else{
		console.log("E No auth cookie found %o",req.signedCookies.username);
		res.render('loginPage',{
			title: "pingOtronic",
			header: "LoginPlease"
		});
	}
};

module.exports ={ authenticateSession};

