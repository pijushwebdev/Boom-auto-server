const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.woapvgk.mongodb.net/?retryWrites=true&w=majority`;

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

    //for tab sub-category
    app.get('/all-toys/:text', async (req,res) => {
      // console.log(req.params.text);
      if(req.params.text == 'Sports_cars' || req.params.text == 'Regular_cars' || req.params.text == 'Police_cars'){
        const result = await toyCollections.find({subCategory: req.params.text}).toArray();

        return res.send(result);
      }
      const result = await toyCollections.find({}).toArray();
      res.send(result);
    })

    //category end

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

    // for update a data

    //for load the clicked data in update page
    app.get('/myToys/:id', async (req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const options = {
        projection: { _id: 1, price: 1, availableQuantity: 1,sellerEmail: 1,detailsDescription: 1 },
      };
      const result = await toyCollections.findOne(query, options);
      res.send(result)
    })
    //for update the data and send to Database
    app.put('/myToys/:id', async (req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedToy = req.body;

      const coffee = {
        $set: {
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity, 
          detailsDescription: updatedToy.detailsDescription
        }
      }
      const result = await toyCollections.updateOne(filter, coffee,options);
      res.send(result)
    })

    //update end....

    //send data to mongodb
    app.post('/toys', async (req, res) => {
        const newToy = req.body;
        // console.log(newToy);
        const result = await toyCollections.insertOne(newToy);
        res.send(result);
    })

    //delete
    app.delete('/myToys/:id', async (req,res) => {
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await toyCollections.deleteOne(query);
      res.send(result);
    })

    //sorting
    app.get('/ascending', async (req,res) => {
      const email = req.query.email;
      const filter = {sellerEmail:email}
      const result = await toyCollections.find(filter).sort({price: 1}).toArray();
      res.send(result);
    })

    app.get('/descending', async (req,res) => {
      const email = req.query.email;
      const filter = {sellerEmail:email}
      const result = await toyCollections.find(filter).sort({price: -1}).toArray();
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

// "src": "/(.*)",
// "dest": "/",