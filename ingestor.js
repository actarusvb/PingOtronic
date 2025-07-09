//
// receive ping response via mqtt and store into db
//

const conf = require('./conf.json');
process.env.TZ = 'UTC';

var mqtt=require('mqtt');
require ( "dotenv").config();

const { pool } = require("./db");


let mqttClient = mqtt.connect(conf.mqttUrl,conf.mqttOptions);

mqttClient.on("connect",function(){	
	console.log(__filename,"MGTT connected");
});
mqttClient.subscribe(conf.topic);

mqttClient.on('message',function(topic, message, packet){
	console.log(new Date(),topic,message.toString());
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
		insertData(pingData);
	}else{
		console.log("skip",message.toString());
	}
});


async function insertData(dbBlock) {
	// console.log("insertData %o %s",dbBlock,parseInt(dbBlock.times));
	console.log(parseInt(dbBlock.times));
	const res = await pool.query(
		"INSERT INTO events (times,size,hostip,seq,ttl,rtt) VALUES (TO_TIMESTAMP($1) AT TIME ZONE 'UTC', $2, $3, $4, $5, $6)",
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
