import getMysqlConnection from "fuegojs/utils/mysql";
import type { MigrationProps } from "fuegojs/dist/migrate";

export const migrate = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    Promise.all([
      connection.execute(
        `CREATE TABLE IF NOT EXISTS events (
          uuid          VARCHAR(36)  NOT NULL,
          type          TINYINT(4)   NOT NULL,
          strategy_uuid VARCHAR(36)  NOT NULL,
  
          PRIMARY KEY (uuid),
          FOREIGN KEY (strategy_uuid) REFERENCES \`strategies\`(\`uuid\`)
        )`
      ),
      connection.execute(
        `CREATE TABLE IF NOT EXISTS event_properties (
          uuid       VARCHAR(36)  NOT NULL,
          label      VARCHAR(64)  NOT NULL,
          value      VARCHAR(64)  NOT NULL,
          event_uuid VARCHAR(36)  NOT NULL,
  
          PRIMARY KEY (uuid),
          FOREIGN KEY (event_uuid) REFERENCES \`events\`(\`uuid\`)
        )`
      ),
    ])
  );
};

export const revert = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    Promise.all([
      connection.execute(`DROP TABLE IF EXISTS event_properties`),
      connection.execute(`DROP TABLE IF EXISTS events`),
    ])
  );
};
