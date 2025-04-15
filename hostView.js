const express = require('express')
var bodyParser = require('body-parser')

const app = express()
const fs = require('node:fs');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const conf = require('./conf.json');

const port = conf.hostViewPort;

var path = require('node:path');
const { pool } = require("./db");


app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname+'/public/'));

app.set('view engine', 'html');

app.get('/hello', (req, res) => {
  res.send('Hello World!')
})
app.get('/chart/:hostip/:start/:stop', async function(req, res) {
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
app.get('/chart/:hostip/:duration', function(req, res) {
	console.log("base chart for host requested",req.params.hostip,req.params.duration);
	res.render('chart', {
		title: "hostView "+req.params.hostip
		,header: "Hosts"
		,duration: 1000*60*	req.params.duration
		,hostip: req.params.hostip
	});
})
app.get('/chart/:hostip', function(req, res) {
	console.log("base chart for host requested",req.params.hostip);
	res.render('chart', {
		title: "hostView "+req.params.hostip
		,header: "Hosts"
		,duration: 1000*60*60
		,hostip: req.params.hostip
	});
});
app.post('/hostsWrite', async function(req, res){
	console.log("hosts cfg write list requested");
	// console.log("hosts cfg write list requested",req.body.fileCnt);
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
app.get('/hosts', async function(req, res){
	console.log("hosts cfg read list requested");
	fs.readFile(conf.hostFnName, 'utf8', (err, data) => {
		if (err) {
			console.log(err);
			res.render('hostsList', {
				title: "hostView Cfg",
				header: "Hosts Config",
				hostfile: "error"
			});
		}else{
			// console.log(data);
			console.log("hosts file  served");
			res.render('hostsList', {
				title: "hostView Cfg",
				header: "Hosts Config",
				hostfile: data
			});
		}
	});
});
app.get('/', async function(req, res){
	console.log("hosts list requested");
	const dataSpan = await pool.query("select min(times) as min,max(times) as max from events")
	const hosts = await pool.query('SELECT distinct hostip from events where times > now() - interval \'48 hour\' ')
	const badHosts = await pool.query('SELECT distinct hostip from badevents where times > now() - interval \'24 hour\' ')
	
	console.log("hosts list served");
	res.render('hosts', {
		dataSpan:dataSpan.rows[0],
		hosts: hosts.rows,
		badHosts: badHosts.rows,
		title: "hostView",
		header: "Hosts"
	});
});

app.listen(port, () => {
  console.log(`hostView app listening on port ${port}`)
});