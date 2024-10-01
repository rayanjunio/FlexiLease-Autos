import "reflect-metadata";
import express from "express";
import connection from "./database/connection";

const app = express();
app.use(express.json());

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
