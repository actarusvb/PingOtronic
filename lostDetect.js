//
// Packet loss detected
//

const conf = require('./conf.json');

var mqtt=require('mqtt');
require ( "dotenv").config();
const { pool } = require("./db");

setInterval(function () {console.log("!");}, conf.timeMarker); // 5 sec markerS

let timeouts={};
let mqttClient = mqtt.connect(conf.mqttUrl,conf.mqttOptions);
mqttClient.on("connect",function(){	
	console.log(__filename,"MGTT connected");
});
mqttClient.subscribe(conf.topic); 
mqttClient.on('message',function(topic, message, packet){
	const tokki=message.toString().split(' ');
		
	if(tokki[0] !=="PING" && tokki[1] !== "From"){
		let pingData = {
			"times": tokki[0].replace('[','').replace(']',''),
			"size": tokki[1],
			"hostip":tokki[4].replace(":",''),
			"seq":tokki[5].split("=")[1],
			"ttl":tokki[6].split("=")[1],
			"rtt":tokki[7].split("=")[1]
		};
		detectPacketLoss(pingData);
	}else{
		// console.log("skip",message.toString());
	}
});

async function detectPacketLoss(dbBlock) {
    if(timeouts[dbBlock.hostip]){
		clearTimeout(timeouts[dbBlock.hostip]);
	}
	timeouts[dbBlock.hostip]=setTimeout(hostExpired,conf.pingTimeout,dbBlock.hostip)    
}
function hostExpired(hostIp){
	console.log(Date.now(), hostIp,"expired",conf.rttOut);
	let dbBlock = {
		"times": Math.floor(Date.now()/1000),
		"size": 0,
		"hostip":hostIp,
		"seq":0,
		"ttl":conf.ttlOut,
		"rtt":conf.rttOut
	};
	insertData(dbBlock);
	insertDataLastLost(dbBlock);
	
}
async function insertData(dbBlock) {
	console.log("insertData",parseInt(dbBlock.times),dbBlock.hostip);
	const res = await pool.query(
		"INSERT INTO events (times,size,hostip,seq,ttl,rtt) VALUES ((TO_TIMESTAMP($1) AT TIME ZONE 'UTC', $2, $3, $4, $5, $6)",
		[
			parseInt(dbBlock.times),
			parseInt(dbBlock.size),
			dbBlock.hostip,
			parseInt(dbBlock.seq),
			parseInt(dbBlock.ttl),
			dbBlock.rtt
		]
	).catch (function (e){
		console.log("Err x",e,dbBlock);
	});
}
async function insertDataLastLost(dbBlock) {
	console.log("insertDataLastLost",parseInt(dbBlock.times),dbBlock.hostip);
	const res = await pool.query(
		"INSERT INTO badevents (times,size,hostip,seq,ttl,rtt) VALUES ((TO_TIMESTAMP($1) AT TIME ZONE 'UTC', $2, $3, $4, $5, $6)",
		[
			parseInt(dbBlock.times),
			parseInt(dbBlock.size),
			dbBlock.hostip,
			parseInt(dbBlock.seq),
			parseInt(dbBlock.ttl),
			dbBlock.rtt
		]
	).catch (function (e){
		console.log("Err x",e,dbBlock);
	});
}
