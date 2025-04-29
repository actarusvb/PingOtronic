/**
 *  Customer Routes 
*/

const Customer = require("../models/Customer");
const mongoose = require("mongoose");
const express = require('express');
const app = express.Router();
const cookieOptions={ httpOnly: true ,signed: true,};
const conf = require('../../conf.json');

const {authenticateSession} = require("../controllers/authenticateSession");

app.get('/list',authenticateSession('isAdmin'), async (req, res) => {
  const messages =  req.flash("info");
  const locals = {
    title: "NodeJs",
    description: "Free NodeJs User Management System",
  };
  let perPage = 12;
  let page = req.query.page || 1;
  try {
    const customers =  await Customer.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count =  await Customer.countDocuments({});
	console.log(customers,count)
    res.render("adminUser", {
      locals,
      customers,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
    });
  } catch (error) {
    console.log(error);
  }
});
app.get('/about', (req, res) => {
  const locals = {
    title: "About",
    description: "Free NodeJs User Management System",
  };

  try {
    res.render("auAbout", locals);
  } catch (error) {
    console.log(error);
  }
});
app.get('/add',authenticateSession('isAdmin'),  (req, res) => {
  const locals = {
    title: "Add New Customer - NodeJs",
    description: "Free NodeJs User Management System",
  };

  res.render("customer/add", locals);
});
app.post('/add',authenticateSession('isAdmin'), async (req, res) => {
  console.log(req.body);

  const newCustomer = new Customer({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
	password: req.body.password,
    details: req.body.details,
    tel: req.body.tel,
    email: req.body.email,
  });

  try {
     await Customer.create(newCustomer);
     req.flash("info", "New customer has been added.");

    res.redirect("/adminUser/list");
  } catch (error) {
    console.log(error);
  }
});
app.get('/view/:id',authenticateSession('isAdmin'), async (req, res) => {
  try {
    const customer =  await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "View Customer Data",
      description: "Free NodeJs User Management System",
    };

    res.render("customer/view", {
      locals,
      customer,
    });
  } catch (error) {
    console.log(error);
  }
});
app.get('/edit/:id',authenticateSession('isAdmin'), async (req, res) => {
  try {
    const customer =  await Customer.findOne({ _id: req.params.id });

    const locals = {
      title: "Edit Customer Data",
      description: "Free NodeJs User Management System",
    };

    res.render("customer/edit", {
      locals,
      customer,
    });
  } catch (error) {
    console.log(error);
  }
});
app.put('/edit/:id',authenticateSession('isAdmin'), async (req, res) => {
  try {
	  console.log("editPost %s %s %s",req.body.email,req.body.enabled,req.body.firstName);
    await Customer.findByIdAndUpdate(req.params.id, {
      enabled: req.body.enabled ? true : false,
	  firstName: req.body.firstName,
      lastName: req.body.lastName,
	  password: req.body.password,
      tel: req.body.tel,
      email: req.body.email,
	  isAdmin: req.body.isAdmin ? true : false,
	  manageHosts: req.body.manageHosts ? true : false,
      details: req.body.details,
      updatedAt: Date.now(),
    });
    await res.redirect(`/adminUser/edit/${req.params.id}`);

    console.log("redirected /adminUser/edit");
  } catch (error) {
    console.log(error);
  }
});
app.delete('/edit/:id',authenticateSession('isAdmin'), async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id });
    res.redirect("/adminUser");
  } catch (error) {
    console.log(error);
  }
});
app.post('/search',authenticateSession('isAdmin'),async (req, res) => {
  const locals = {
    title: "Search Customer Data",
    description: "Free NodeJs User Management System",
  };

  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const customers = await Customer.find({
      $or: [
        { firstName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { lastName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
      customers,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});
app.post('/login', async (req, res) => {
	try {
		const { userName, password } = req.body;
		console.log("POST /login %s %s",userName, password );
		const customer = await Customer.findOne({ email: userName });
		console.log("POST /login  %o",customer);
		if (customer && password === customer.password && customer.enabled === true) {
			console.log("POST /login OK %s",userName);
			console.log("POST /login OK in req %s",req.user);

			console.log("POST /login OK in req aft save %s",customer.email);
				res.status(301)
					.cookie('username', customer.email,cookieOptions)
					.cookie('isAdmin', customer.isAdmin, cookieOptions)
					.cookie('manageHosts', customer.manageHosts,cookieOptions )
					.redirect("/")
		} else {
			console.log("POST /login KO %s",userName);
			res.redirect(301,"/login");
		}  
	} catch (error) {
		console.log(error);
	}
});
app.get('/logout', async (req, res) => {
	res.status(301)
		.clearCookie('username')
		.clearCookie('isAdmin')
		.clearCookie('manageHosts')
		.redirect("/")
});
module.exports = app;