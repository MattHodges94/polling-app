import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

before(async () => {
    mongoServer = new MongoMemoryServer({
        instance: {
            port: 2170,
            dbName: 'test',
        }
    });

    const mongoUri = await mongoServer.getConnectionString();

    mongoose.connect(mongoUri)
});

after(async () => {
    await mongoose.disconnect();
    return mongoServer.stop();
});
