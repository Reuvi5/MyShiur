import express from "express";
import connectDB from "./conn.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";


const router = express.Router();
const db = await connectDB(); 

// Middleware
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      return res.status(403).json({ message: 'Failed to authenticate token.' });
  }
}

// Get a list of 50 shiurim
router.get("/", async (req, res) => {
  let collection = db.collection("shiurim");
  let results = await collection.find({})
    .limit(50)
    .toArray();

  res.status(200).send(results);
});

// Fetch the latest shiurim
router.get("/latest", async (req, res) => {
  let collection = db.collection("shiurim");
  let results = await collection.aggregate([
    { "$project": { "name": 1, "datetime": 1 } },
    { "$sort": { "datetime": -1 } },
    { "$limit": 3 }
  ]).toArray();

  res.status(200).send(results);
});

// Get a single shiur
router.get("/:id", async (req, res) => {
  let collection = db.collection("shiurim");
  let query = { _id: ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// Add a new shiur
router.post("/addShiur", authenticate, async (req, res) => {
  let collection = db.collection("shiurim");
  let newDocument = req.body;
  newDocument.datetime = new Date();
  let result = await collection.insertOne(newDocument);

  res.status(201).json({ message: "Shiur added successfully. Sign out and sign back in to see your shiur" });
});

// Update with a new comment
router.patch("/comment/:id", authenticate, async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $push: { comments: req.body }
  };

  let collection = db.collection("shiurim");
  let result = await collection.updateOne(query, updates);

  res.status(200).send(result);
});

// Delete a shiur
router.delete("/:id", authenticate, async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };

  const collection = db.collection("shiurim");
  let result = await collection.deleteOne(query);

  res.status(200).send(result);
});

export default router;