import "reflect-metadata";
import express from "express";
import { getConnection } from "./database/connection";
import carRoutes from "./routes/carRoutes";
import userRoutes from "./routes/userRoutes";
import authRoute from "./routes/authRoute";
import reserveRoutes from "./routes/reserveRoutes";

const app = express();
app.use(express.json());

app.use("/v1", carRoutes, userRoutes, authRoute, reserveRoutes);

async function startServer() {
  try {
    await getConnection();
    console.log("Connection with database ready!");

    app.listen(3000, () => {
      console.log("Server running in port 3000");
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
