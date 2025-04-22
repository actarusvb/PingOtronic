const Customer = require("../models/Customer");
const mongoose = require("mongoose");

exports.homepage = async (req, res) => {
  const messages = await req.flash("info");
  const locals = {
    title: "NodeJs",
    description: "Free NodeJs User Management System",
  };
  let perPage = 12;
  let page = req.query.page || 1;
  try {
    const customers = await Customer.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Customer.countDocuments({});
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
};
exports.about = async (req, res) => {
  const locals = {
    title: "About",
    description: "Free NodeJs User Management System",
  };

  try {
    res.render("auAbout", locals);
  } catch (error) {
    console.log(error);
  }
};
exports.addCustomer = async (req, res) => {
  const locals = {
    title: "Add New Customer - NodeJs",
    description: "Free NodeJs User Management System",
  };

  res.render("customer/add", locals);
};
exports.postCustomer = async (req, res) => {
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
    await req.flash("info", "New customer has been added.");

    res.redirect("/adminUser");
  } catch (error) {
    console.log(error);
  }
};
exports.view = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

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
};
exports.edit = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id });

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
};
exports.editPost = async (req, res) => {
  try {
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
};
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id });
    res.redirect("/adminUser");
  } catch (error) {
    console.log(error);
  }
};
exports.searchCustomers = async (req, res) => {
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
};
