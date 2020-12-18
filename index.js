const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs-extra");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("services"));
app.use(fileUpload());

const port = 7000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbh3l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true,});
client.connect((err) => {
  const productsCollection = client.db("pos-system").collection("products");
  const customersCollection = client.db("pos-system").collection("customers");
  const ordersCollection = client.db("pos-system").collection("orders");
  // const adminsCollection = client.db("pos-system").collection("admins");

  app.post("/addproduct", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    productsCollection
      .insertOne({ name, description,price, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    //console.log(review);
    customersCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/products", (req, res) => {
    productsCollection.find({}).toArray((err, documents) => {
      res.send(documents);  
    });
  });

  app.get("/servicesOrdered", (req, res) => {
    ordersCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/allproductsordered", (req, res) => {
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/reviews", (req, res) => {
    customersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // app.post("/addAdmin", (req, res) => {
  //   const admin = req.body;
  //   adminsCollection.insertOne(admin).then((result) => {
  //     res.send(result.insertedCount > 0);
  //   });
  // });
  //
  // app.post("/isAdmin", (req, res) => {
  //   const email = req.body.email;
  //   adminsCollection.find({ email: email }).toArray((err, admins) => {
  //     res.send(admins.length > 0);
  //   });
  // });
});

app.get("/", (req, res) => {
  res.send("Working bal!!!");
  res.end();
});
// console.log(process.env.PORT || port)
app.listen(process.env.PORT || port);
