import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import type { MigrationProps } from "fuegojs/dist/migrate";

export const migrate = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection.execute(
      `CREATE TABLE IF NOT EXISTS algorithms (
          uuid    VARCHAR(36)  NOT NULL,
          label   VARCHAR(64)  NOT NULL,
          user_id VARCHAR(32)  NOT NULL,
  
          PRIMARY KEY (uuid),
          CONSTRAINT UC_name UNIQUE (label,user_id)
        )`
    )
  );
};

export const revert = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection.execute(`DROP TABLE IF EXISTS algorithms`)
  );
};
