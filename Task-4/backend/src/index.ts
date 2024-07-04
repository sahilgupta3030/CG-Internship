import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import mysqlpool from './config/db';
import dotenv from 'dotenv';
import router from './routes/usersRoutes';

dotenv.config();

const app = express();

// Middleware....
app.use(bodyParser.json());

// Routes
app.use("/users", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("<h1>App starts server and listens on port 8000 for connections..</h1>");
});

// Database connection check and server start
const startServer = async (): Promise<void> => {
  try {
    await mysqlpool.query("SELECT 1");
    console.log("MySQL database connected successfully..");
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
};

startServer();

