const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("doTogether");
    const eventsCollection = database.collection("events");

    app.get("/events", async (req, res) => {
      const allEvents = await eventsCollection.find().toArray();
      console.log(allEvents);
      res.send(allEvents);
    });

    // save event in db
    app.post("/add-event", async (req, res) => {
      const eventData = req.body;
      const result = await eventsCollection.insertOne(eventData);
      console.log(result);
      res.status(201).send({ ...result, msg: "data paisi" });
    });

    // get a single event by id
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const event = await eventsCollection.findOne(filter);
      console.log(event);
      res.send(event);
    });

    // get events by user email
    app.get("/myevents/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };

      const event = await eventsCollection.find(filter).toArray();
      console.log(event);
      res.send(event);
    });

    // delete event
    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(query);
      res.send(result);
    });
    // const eventJointUserCollection = client
    //   .db("doTogether")
    //   .collection("jointUser");
    // events API
    // app.get("/events", async (req, res) => {
    //   const email = req.query.email;
    //   const query = {};
    //   if (email) {
    //     query.email = email;
    //   }
    //   const cursor = eventsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // app.post("/events", async (req, res) => {
    //   const newEvent = req.body;
    //   const result = await eventsCollection.insertOne(newEvent);
    //   res.send(result);
    // });

    // app.delete("/events/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await eventsCollection.deleteOne(query);
    //   res.send(result);
    // });

    // app.get("/jointevent", async (req, res) => {
    //   const email = req.query.email;
    //   const query = {
    //     userEmail: email,
    //   };
    //   const result = await eventJointUserCollection.find(query).toArray();
    //   for (const event of result) {
    //     const eventId = event.eventId;
    //     const eventQuery = { _id: new ObjectId(eventId) };
    //     const joint = await eventsCollection.findOne(eventQuery);
    //     event.title = joint.title;
    //     event.location = joint.location;
    //     event.eventType = joint.eventType;
    //     event.date = joint.date;
    //     event.photoURL = joint.photoURL;
    //     event.organizer = joint.organizer;
    //     event.description = joint.description;
    //   }

    //   res.send(result);
    // });

    // // joint event related APIs
    // app.post("/jointevent", async (req, res) => {
    //   const { eventId, userEmail } = req.body;
    //   const alreadyJoined = await eventJointUserCollection.findOne({
    //     eventId,
    //     userEmail,
    //   });
    //   if (alreadyJoined) {
    //     return res.send({ joinedBefore: true });
    //   }

    //   const result = await eventJointUserCollection.insertOne({
    //     eventId,
    //     userEmail,
    //   });
    //   res.send(result);
    // });

    // // app.get("/myevents", async (req, res) => {
    // //   const email = req.query.email;
    // //   const query = { email: email };
    // //   const result = await eventsCollection.find(query).toArray();
    // //   res.send(result);
    // // });
    // app.get("/events/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await eventsCollection.findOne(query);
    //   res.send(result);
    // });

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
