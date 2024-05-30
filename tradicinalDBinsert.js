const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://ojlelati07:mongoDBpassword@cluster0.rdrbxcu.mongodb.net/";
const client = new MongoClient(url);
const main = async () => {
  await client.connect();
  console.log("connected successfuly to server");
  const db = client.db("first-node-app");
  const collection = db.collection("lessons");

  await collection.insertOne({
    title: "new course",
    price: 2500,
  });
  const data = await collection.find().toArray();
  console.log(data);
};
main();
