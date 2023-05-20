const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://boomAuto:eskQSAAVgnhuIjUH@cluster0.woapvgk.mongodb.net/?retryWrites=true&w=majority";

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

    const toyCollections = client.db("toysDB").collection('toys');


    //send all car data to client side or get data from mongodb
    app.get('/all-toys', async (req,res) => {
        const toys = await toyCollections.find().limit(20).toArray();
        res.send(toys);
    })

    //find my-toys by gmail
    app.get('/my-toys/:email', async (req,res) => {
      const email = req.params.email;
      // console.log(email);
      const query = {sellerEmail: req.params.email};
      const result = await toyCollections.find(query).toArray();
      res.send(result);
    })

    //start search operation by Toy name
    const indexKey = {toyName: 1};
    const indexOption = {name: "toySearch"};
    const result = await toyCollections.createIndex(indexKey,indexOption);

    // to handle error for empty string
    app.get('/toySearch', async (req,res) => {
        const toys = await toyCollections.find().limit(20).toArray();
        res.send(toys);
    })
    app.get('/toySearch/:text', async (req,res) => {
      const searchText = req.params.text;
      const result = await toyCollections.find({toyName: {$regex: searchText, $options: "i"}}).toArray();
      console.log(result);
      res.send(result);
    })
    //end search

    //find single data by Id
    app.get('/all-toys/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await toyCollections.findOne(query);
        res.send(result)
    })

    //send data to mongodb
    app.post('/toys', async (req, res) => {
        const newToy = req.body;
        // console.log(newToy);
        const result = await toyCollections.insertOne(newToy);
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



app.get('/', (req,res) => {
    res.send('BoomAuto server');
})

app.listen(port, () => {
    console.log(`Boom server is running on port: ${port}`);
})