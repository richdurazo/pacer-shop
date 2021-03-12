const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) => {
    mongoClient.connect(process.env.MONGODB_URI)
    .then(client => {
        console.log('Connected!');
        _db = client.db();
        callback(client)
    })
    .catch(err => {
        console.log(err)
        throw err;
    })
}
const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No Database found'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;