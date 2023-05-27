const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const addToyCollection = client.db('toysAnimal').collection('addToy');

        // create index

        const indexKeys = {Name:1};
        const indexOPtions = {name:"Name_1"};
        const result1 = await toysCollection.createIndex(indexKeys,indexOPtions)
        const result2 = await addToyCollection.createIndex(indexKeys,indexOPtions)

        app.get('/toysSearch/:text',async(req,res)=>{
            const searchText = req.params.text;
            
            // let result;
            const result1 = await toysCollection.find({
               $or: [
                    {Name: {$regex: searchText, $options: "i"}}
                ],
            }).toArray();
            
                const result2 = await addToyCollection.find({
                    $or: [
                         {Name: {$regex: searchText, $options: "i"}}
                     ],
                 }).toArray();
                //  if(result1){
                //     result = result1;
                // }
                // else if(result2)
                // {
                //     result = result2;
                // }
               const result = [...result1,...result2]
            res.send(result);
        })

        app.get('/toys',async(req,res)=>{
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/allToys',async(req,res)=>{
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            const cursor2 = await addToyCollection.find().toArray();
            const result2 = [...result,...cursor2] ;
            res.send(result2);

        })

        app.get('/toys/:toys_by_category',async(req,res)=>{
            console.log(req.params.toys_by_category)
            if(req.params.toys_by_category == "Teddy Bear" || req.params.toys_by_category == "Horse" || req.params.toys_by_category == "dinosaur") {
                 const result = await toysCollection.find({category: req.params.toys_by_category}).toArray();
                 return res.send(result)
            }
            const result = await toysCollection.find({}).toArray();
            res.send(result)
        })

        app.get('/toyss/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const options = {
                projection:{Name: 1, Price: 1, Rating: 1, Quantity: 1, Picture: 1, details: 1}
            }
            let result;
            
            const result1 = await toysCollection.findOne(query,options);
            if(result1){
                result = result1;
            }
            else{
                const result2 = await addToyCollection.findOne(query,options);
                result = result2;
            }

            res.send(result);
        })

        // add toy
        app.get('/addToy',async(req,res)=>{
            console.log(req.query.email);
            let query = {};
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const result = await addToyCollection.find(query).toArray();
            res.send(result);   
        })
        app.post('/addToy',async(req,res)=>{
            const addToy = req.body;
            console.log(addToy);
            const result = await addToyCollection.insertOne(addToy);
            // const result2 = await toysCollection.insertOne(addToy);
            res.send(result);   
        });
       
        

        app.patch('/updated/:id',async(req,res)=>{
            const updatedToy = req.body;
            console.log(updatedToy);
            
        })

        app.delete('/addToy/:id',async(req,res)=>{
            id = req.params.id;
            const query ={_id: new ObjectId(id)}
            const result = await addToyCollection.deleteOne(query);
            res.send(result);
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