//npm install mongodb
//npm install dotenv

import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import ReviewsDAO from "./dao/reviewsDAO.js";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: './movie.env' });
}

const MongoClient = mongodb.MongoClient;
const mongo_username = process.env['MONGO_USERNAME'];
const mongo_password = process.env['MONGO_PASSWORD'];
const mongo_dbName = process.env['MONGO_DBNAME'];
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.y0sew.mongodb.net/${mongo_dbName}`;

const port = 8000;

MongoClient.connect(uri, 
    {
        maxPoolSize:50, 
        wtimeoutMS:2500
    })
    .catch(err => {
        console.error(err.stack);
        process.exit(1);
    })
    .then(async client => {
        await ReviewsDAO.injectDB(client);
        app.listen(port, () => {
        console.log(`listening on port ${port}`);
        })
    })