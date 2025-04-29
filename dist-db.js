const { Pool } = require("pg");

const pool = new Pool({
  database: "pingotronic",
  user: "dbuser",
  password: "dbpass",
  port: 5432,
  host: "localhost",
});

module.exports = { pool };
