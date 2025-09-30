import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import * as path from "path";
import { registerAs } from "@nestjs/config";
export default registerAs(
    "dbConfig.dev",
    (): PostgresConnectionOptions => (
        {
            //do not put this here, inserted env file
            url: process.env.url,
            type: "postgres",
            port: +(process.env.port ?? 5432),
            entities: [path.resolve(__dirname, "..") + "/**/*.entity{.ts,.js}"],
            synchronize: true, // it is help to development mode but production mode highly discress true, synchronize false because accidentally one column remove table this column information distroy permanently

        }));