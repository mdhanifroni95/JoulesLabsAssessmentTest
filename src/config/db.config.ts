import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as path from "path";
import { registerAs } from "@nestjs/config";

export default registerAs(
  "dbConfig.dev",
  (): PostgresConnectionOptions => ({
    type: "postgres",
    url: process.env.DATABASE_URL, // use proper env var
    port: +(process.env.DB_PORT ?? 5433), // correct default for Postgres
    entities: [path.resolve(__dirname, "..") + "/**/*.entity{.ts,.js}"],
    synchronize: true, // ⚠️ use false in production
    ssl: { rejectUnauthorized: false },
  }),
);
