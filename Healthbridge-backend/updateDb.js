const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://hirunahansindugamage_db_user:4iSJFnCbtvECylD5@ac-5pyc1nb-shard-00-00.2tysxzi.mongodb.net:27017,ac-5pyc1nb-shard-00-01.2tysxzi.mongodb.net:27017,ac-5pyc1nb-shard-00-02.2tysxzi.mongodb.net:27017/health-bridge-dev?ssl=true&replicaSet=atlas-q3tlbn-shard-0&authSource=admin&appName=Cluster0';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('health-bridge-dev');
    const users = database.collection('users');
    const result = await users.updateOne(
      { _id: new ObjectId('6a858264578ec5d69db2c94b') },
      { $set: { bloodType: 'AB-', bloodGroup: 'AB-', allergies: ['Peanuts'], conditions: ['Asthma'] } }
    );
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
