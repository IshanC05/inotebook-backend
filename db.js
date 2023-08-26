const mongoose = require('mongoose');
require('dotenv').config()

const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@inotebook-db.p5vptoq.mongodb.net/?retryWrites=true&w=majority`

const connectToMongo = async () => {

    try {
        mongoose.connect(mongoURI);
        console.log('Connected to db successfully!')
    } catch (error) {
        handleError(error);
    }
}

module.exports = connectToMongo;