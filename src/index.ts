import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./database/connection";
import carRoutes from "./routes/carRoutes";
import userRoutes from "./routes/userRoutes";
import authRoute from "./routes/authRoute";
import reserveRoutes from "./routes/reserveRoutes";
import documentationRoute from './routes/documentationRoute';

const app = express();
app.use(express.json());

app.use("/v1", carRoutes, userRoutes, authRoute, reserveRoutes, documentationRoute);

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log("Connection with database ready!");

    app.listen(3000, () => {
      console.log("Server running in port 3000");
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
