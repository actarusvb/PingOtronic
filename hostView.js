
require('dotenv').config();
const express = require('express');
var bodyParser = require('body-parser')
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const fs = require('node:fs');
var path = require('node:path');
var morgan = require('morgan')
var cookieParser = require('cookie-parser')


const conf = require('./conf.json');
const Customer = require("./routes/models/Customer");
const mongoose = require("mongoose");

const connectDB = require('./routes/config/db');

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan('combined'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({secret: conf.SessionSecretKey,resave: false,saveUninitialized: true,cookie: {maxAge: 1000 * 60 * 60 * 24 * 1,secure: true}}));
app.set('views', path.join(__dirname, 'views'));
app.set('layout', './layouts/main');
app.use(express.static(__dirname+'/public/'));
app.set('view engine', 'ejs');
app.use(flash({ sessionKeyName: 'flashMessage' }));
app.use(expressLayout);

connectDB(conf.mongodbUri);
const { pool } = require("./db");


const {authenticateSession} = require("./routes/controllers/authenticateSession");
app.use('/adminUser', require('./routes/routes/customer'));
app.use('/login', require('./routes/routes/customer'));
app.get('/hello', (req, res) => {
  res.send('Hello World!')
})
app.get('/chart/:hostip/:start/:stop',authenticateSession, async function(req, res) {
	console.log("record for",req.params.hostip,req.params.start,req.params.stop);
	let query={
		text: "SELECT times,rtt from events  where hostip = $1 and times AT TIME ZONE 'UTC' > $2 and times AT TIME ZONE 'UTC' < $3 order by times asc",
		values: [req.params.hostip,req.params.start,req.params.stop]
	};
	console.log(query);
	const dati = await pool.query(query);
	let labels=[];
	let rtt=[];
	dati.rows.forEach(function(val){ 
		labels.push(val.times);
		rtt.push(val.rtt);
	});
	console.log("serve",rtt.length,labels.length);
	respo={
		label: labels,
		data: rtt,
	}
	res.send(respo);
});
app.get('/chart/:hostip/:duration',authenticateSession, function(req, res) {
	console.log("base chart for host requested",req.params.hostip,req.params.duration);
	res.render('chart', {
		title: "hostView "+req.params.hostip
		,header: "Hosts"
		,duration: 1000*60*	req.params.duration
		,hostip: req.params.hostip
	});
})
app.get('/chart/:hostip',authenticateSession, function(req, res) {
	console.log("base chart for host requested",req.params.hostip);
	res.render('chart', {
		title: "hostView "+req.params.hostip
		,header: "Hosts"
		,duration: 1000*60*60
		,hostip: req.params.hostip
	});
});
app.post('/hostsWrite',authenticateSession, async function(req, res){
	console.log("hosts cfg write list requested");
	fs.writeFile(conf.hostFnName, req.body.fileCnt, err => {
		if (err) {
			console.error(err);
			res.send({result: "fail 01"});
		} else {
			console.log("Hosts file writed");
			res.send({result: "ok 01"});
		}
	});
});
app.get('/processCtrlStatus',authenticateSession, function(req,res){
	console.log("get processCtrlStatus");
	fs.access(conf.procesCtrlFnName, fs.constants.F_OK, (err) => {
		console.log(`${err ? 'does not exist' : 'exists'}`);
		if(err){
			res.send({result: "ok 04",status: false});
		}else{
			res.send({result: "ok 03",status: true});
		}
	});
});
app.get('/processCtrl/:newMode',authenticateSession, function(req,res){
	console.log("processCtrl %s",req.params.newMode);
	if(req.params.newMode === "run"){
		fdata=new Date().toString();
		console.log(fdata);
		fs.writeFile(conf.procesCtrlFnName, fdata, err => {
		if (err) {
			console.error(err);
			res.send({result: "fail 02"});
		} else {
			console.log("%s was created",conf.procesCtrlFnName);
			res.send({result: "ok 01",status: "started"});
		}
	});
	}else if(req.params.newMode === "stop"){
		fs.unlink(conf.procesCtrlFnName, (err) => {
			if (err) throw err;
			console.log("%s was deleted",conf.procesCtrlFnName);
			res.send({result: "ok 01",status: "stopped"});
		}); 
	}else {
		res.send({result: "error 02"});
	}
});
app.get('/hosts',authenticateSession, async function(req, res){
	console.log("hosts cfg read list requested");
	fs.readFile(conf.hostFnName, 'utf8', (err, data) => {
		if (err) {
			console.log(err);
			res.render('hostsList', {
				title: "pingOtronic Cfg",
				header: "Hosts Config",
				hostfile: { data: "error"}
			});
		}else{
			console.log("hosts file  served");
			res.render('hostsList', {
				title: "pingOtronic Cfg",
				header: "Hosts Config",
				hostfile: data
			});
		}
	});
});
app.get('/about',authenticateSession, async function(req, res){
	console.log("about pingOtronic requested");
	res.render('pingOtronicAbout',{
		title: "pingOtronic",
		header: "Hosts"
	});
});
app.get('/protected',authenticateSession, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  res.send(`Hello ${user.username}, you have accessed a protected route!`);
});
app.get('/',authenticateSession, async function(req, res){
	console.log("hosts list requested");
	const dataSpan = await pool.query("select min(times) as min,max(times) as max from events")
	const hosts = await pool.query('SELECT distinct hostip from events where times > now() - interval \''+conf.HostListDeep+'\' ')
	const badHosts = await pool.query('SELECT distinct hostip from badevents where times > now() - interval \''+conf.BadHostListDeep+'\' ')
	
	console.log("hosts list served");
	res.render('hosts', {
		dataSpan:dataSpan.rows[0],
		hosts: hosts.rows,
		badHosts: badHosts.rows,
		title: "pingOtronic",
		header: "Hosts"
	});
});

app.listen(conf.hostViewPort, () => {
  console.log(`hostView app listening on port ${conf.hostViewPort}`)
});


