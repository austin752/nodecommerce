// --- connect to a mysql server
// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-sql',
//     password: 'nodecomplete'
// });

// module.exports = pool.promise();

// --- connect to mysql server using sequelize
// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'nodecomplete', {
//     dialect: 'mysql',
//     host: 'localhost'
// });

// module.exports = sequelize;


// ---- connect to mongo cloud
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;
// /const url = 'mongodb://localhost:27017';
const mongoConnect = cb => {
    MongoClient
    .connect('mongodb+srv://austin752:somepassword@cluster0-0ynct.mongodb.net/shop?retryWrites=true', { useNewUrlParser: true })
    .then(client => {
        console.log('connected');
        db = client.db();
        //db = client.db('test');
        cb();
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
};

const getDb = () => {
    if(db){
        return db;
    }
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;