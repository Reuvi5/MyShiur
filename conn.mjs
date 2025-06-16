import { MongoClient } from "mongodb";

const uri = "mongodb+srv://rkupchik:Squeeks5@cluster0.lnurwql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db("myDatabase"); 

    } catch (e) {
        console.error("Failed to connect to MongoDB", e);
        process.exit(1);
    }
}

export default connectDB;