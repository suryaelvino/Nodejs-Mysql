import express from 'express';
import { testDatabaseConnection } from './src/database/db';
const app = express();
const port = process.env.PORT || 3000;

testDatabaseConnection();

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});