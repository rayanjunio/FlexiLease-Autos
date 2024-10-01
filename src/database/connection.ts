import { createConnection } from "typeorm";

export default async function connection() {
  const connection = await createConnection();
  return connection;
}
