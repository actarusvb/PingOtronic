const mongoose = require('mongoose');
const connectDB = async(dbName)=> {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(dbName);
    console.log(`Mongo Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
}



module.exports = connectDB;

