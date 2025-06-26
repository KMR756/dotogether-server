const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eia6tyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const eventsCollection = client.db("doTogether").collection("events");
    const eventJointUserCollection = client
      .db("doTogether")
      .collection("jointUser");
    // events API
    app.get("/events", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = eventsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/events", async (req, res) => {
      const newEvent = req.body;
      const result = await eventsCollection.insertOne(newEvent);
      res.send(result);
    });

    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/jointevent", async (req, res) => {
      const email = req.query.email;
      const query = {
        userEmail: email,
      };
      const result = await eventJointUserCollection.find(query).toArray();
      for (const event of result) {
        const eventId = event.eventId;
        const eventQuery = { _id: new ObjectId(eventId) };
        const joint = await eventsCollection.findOne(eventQuery);
        event.title = joint.title;
        event.location = joint.location;
        event.eventType = joint.eventType;
        event.date = joint.date;
        event.photoURL = joint.photoURL;
        event.organizer = joint.organizer;
        event.description = joint.description;
      }

      res.send(result);
    });

    // joint event related APIs
    app.post("/jointevent", async (req, res) => {
      const { eventId, userEmail } = req.body;
      const alreadyJoined = await eventJointUserCollection.findOne({
        eventId,
        userEmail,
      });
      if (alreadyJoined) {
        return res.send({ joinedBefore: true });
      }

      const result = await eventJointUserCollection.insertOne({
        eventId,
        userEmail,
      });
      res.send(result);
    });

    // app.get("/myevents", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const result = await eventsCollection.find(query).toArray();
    //   res.send(result);
    // });
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("doTogether cooking....");
});

app.listen(port, () => {
  console.log("doTogether server is running on port ${port} ");
});
