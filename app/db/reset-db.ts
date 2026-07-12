import mysql from "mysql2/promise";
import { env } from "../api/lib/env";

async function main() {
  console.log("Connecting to MySQL server to reset database...");
  
  // Parse connection URL to connect to the MySQL server (without database name)
  const url = new URL(env.databaseUrl);
  const databaseName = url.pathname.substring(1); // hiline_pro_care
  
  // Create connection URL without the database name
  url.pathname = "/";
  const serverUrl = url.toString();
  
  const connection = await mysql.createConnection(serverUrl);
  
  console.log(`Dropping database ${databaseName} if exists...`);
  await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\`;`);
  
  console.log(`Creating database ${databaseName} with utf8mb4 charset...`);
  await connection.query(
    `CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  
  await connection.end();
  console.log("Database reset complete!");
}

main().catch(console.error);
