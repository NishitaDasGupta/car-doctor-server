const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());
require('dotenv').config();

// const uri = "mongodb+srv://carDoctor:cx53SkLiKy1iVX0J@cluster0.gvng5am.mongodb.net/?retryWrites=true&w=majority";


var uri = "mongodb://carDoctor:cx53SkLiKy1iVX0J@ac-eg0vsya-shard-00-00.gvng5am.mongodb.net:27017,ac-eg0vsya-shard-00-01.gvng5am.mongodb.net:27017,ac-eg0vsya-shard-00-02.gvng5am.mongodb.net:27017/?ssl=true&replicaSet=atlas-bv7dpn-shard-0&authSource=admin&retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const servicesCollection = client.db("carDoctorDb").collection("services");
        const bookingsCollection = client.db("carDoctorDb").collection("bookings");
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 }
            };
            const result = await servicesCollection.findOne(query, options);
            res.send(result);
        })

        // booking 

        app.get('/bookings', async (req, res) => {
            // console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = {
                    email: req.query.email,
                }
            }
            const cursor = bookingsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            //console.log(updatedBooking);
            // main work of update 
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: `confirm`
                },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Car doctor is running...");
})

app.listen(port, (req, res) => {
    console.log(`Car Doctor Server port is ${port}`);
})