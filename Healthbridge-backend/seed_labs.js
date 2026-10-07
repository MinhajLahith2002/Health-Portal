const { MongoClient } = require('mongodb');

const uri = 'mongodb://hirunahansindugamage_db_user:4iSJFnCbtvECylD5@ac-5pyc1nb-shard-00-00.2tysxzi.mongodb.net:27017,ac-5pyc1nb-shard-00-01.2tysxzi.mongodb.net:27017,ac-5pyc1nb-shard-00-02.2tysxzi.mongodb.net:27017/?ssl=true&replicaSet=atlas-q3tlbn-shard-0&authSource=admin&appName=Cluster0';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('health-bridge-dev');
    const collection = db.collection('laboratories');

    await collection.deleteMany({}); // Clear existing

    const mockRegistrations = [
      {
        labId: "LB-1",
        name: "GreenLine Diagnostics",
        address: "123/saman lane-Negombo, Western",
        license: "LB-WP-123",
        owner: "S. Perera",
        requestDate: "2026/5/4",
        approvedDate: "-",
        status: "Pending",
        _class: "lk.gamage.backend.healthbridgebackend.model.Laboratory"
      },
      {
        labId: "LB-2",
        name: "CityLab Analytics",
        address: "45/A High Level Rd, Colombo 06",
        license: "LB-WP-442",
        owner: "K. Silva",
        requestDate: "2026/5/3",
        approvedDate: "-",
        status: "Pending",
        _class: "lk.gamage.backend.healthbridgebackend.model.Laboratory"
      },
      {
        labId: "LB-3",
        name: "MediTest Hub",
        address: "12 Kandy Road, Kiribathgoda",
        license: "LB-WP-891",
        owner: "M. Fernando",
        requestDate: "2026/5/2",
        approvedDate: "-",
        status: "Pending",
        _class: "lk.gamage.backend.healthbridgebackend.model.Laboratory"
      },
      {
        labId: "LB-4",
        name: "Apex Clinical Labs",
        address: "88 Galle Road, Mount Lavinia",
        license: "LB-WP-105",
        owner: "R. Jayawardena",
        requestDate: "2026/4/15",
        approvedDate: "2026/4/18",
        status: "Approved",
        _class: "lk.gamage.backend.healthbridgebackend.model.Laboratory"
      },
      {
        labId: "LB-5",
        name: "Lanka Bio Services",
        address: "210 Baseline Road, Colombo 08",
        license: "LB-WP-334",
        owner: "T. Bandara",
        requestDate: "2026/4/10",
        approvedDate: "2026/4/12",
        status: "Rejected",
        _class: "lk.gamage.backend.healthbridgebackend.model.Laboratory"
      }
    ];

    await collection.insertMany(mockRegistrations);
    console.log("Successfully seeded laboratories collection");
  } finally {
    await client.close();
  }
}

seed().catch(console.dir);
