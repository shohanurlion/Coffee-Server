const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nu75c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const coffeCollection = client.db('usersDB').collection('coffe');
    app.get('/coffe', async(req , res)=>{
      const cursor = coffeCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/coffe/:id' , async(req , res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await coffeCollection.findOne(query);
      res.send(result);
    })

    app.post('/coffe', async(req, res)=>{
        const coffeInfo = req.body;
        console.log('new coffe', coffeInfo);
        const result = await coffeCollection.insertOne(coffeInfo);
        res.send(result);
        
    });
    app.put('/coffe/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const user = req.body;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }
    
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatecoffes = {
          $set: {
            name: user.name,
            chef: user.chef,
            supplier: user.supplier,
            taste: user.taste,
            category: user.category,
            details: user.details,
            photo: user.photo,
          },
        };
    
        const result = await coffeCollection.updateOne(filter, updatecoffes, options);
        res.send(result);
      } catch (error) {
        console.error("Error updating coffee:", error);
        res.status(500).send({ error: "An error occurred while updating the coffee" });
      }
    });
    
    app.delete('/coffe/:id', async(req , res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await coffeCollection.deleteOne(query);
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

app.get('/',(req , res)=>{
    res.send('Hello World'); // Correct
});

app.listen(port, ()=>{
    console.log(`Server is running ${port}`);
    
})