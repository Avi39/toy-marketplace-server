const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nx8jou2.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        const  toysCollection = client.db('toysAnimal').collection('toysInformation');

        app.get('/toys',async(req,res)=>{
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toys/:toys_by_category',async(req,res)=>{
            console.log(req.params.toys_by_category)
            if(req.params.toys_by_category == "Teddy Bear" || req.params.toys_by_category == "Horse" || req.params.toys_by_category == "dinosaur") {
                 const result = await toysCollection.find({category: req.params.toys_by_category}).toArray();
                 return res.send(result)
            }
            
            
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('toy is running');
})
app.listen(port, () => {
    console.log(`running on port ${port}`);
})