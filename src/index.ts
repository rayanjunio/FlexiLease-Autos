import "reflect-metadata";
import express from "express";
import connection from "./database/connection";
import carRoutes from "./routes/carRoutes";

const app = express();
app.use(express.json());

app.use("/v1", carRoutes);

async function startServer() {
  try {
    await connection();
    console.log("Connection with database ready!");

    app.listen(3000, () => {
      console.log("Server running in port 3000");
    });
  } catch (err) {
    console.log(err);
  }
}

startServer();
