const { Pool } = require("pg");

const pool = new Pool({
  user: "mqtt",
  database: "pingotronic",
  password: "mqttPass",
  port: 5432,
  host: "localhost",
});

module.exports = { pool };
