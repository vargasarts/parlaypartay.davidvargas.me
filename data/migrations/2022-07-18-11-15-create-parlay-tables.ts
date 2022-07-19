import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import type { MigrationProps } from "fuegojs/dist/migrate";

export const migrate = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection
      .execute(
        `CREATE TABLE IF NOT EXISTS parlays (
          uuid          VARCHAR(36)  NOT NULL,
          attempt       INT          NOT NULL,
          gameplan_uuid VARCHAR(36)  NOT NULL,
  
          PRIMARY KEY (uuid),
          FOREIGN KEY (gameplan_uuid) REFERENCES \`gameplans\`(\`uuid\`)
        )`
      )
      .then(() =>
        connection.execute(
          `CREATE TABLE IF NOT EXISTS parlay_results (
          uuid          VARCHAR(36)  NOT NULL,
          event_uuid    VARCHAR(36)  NOT NULL,
          parlay_uuid   VARCHAR(36)  NOT NULL,
          outcome       TINYINT(1)   NOT NULL,
  
          PRIMARY KEY (uuid),
          FOREIGN KEY (event_uuid) REFERENCES \`events\`(\`uuid\`),
          FOREIGN KEY (parlay_uuid) REFERENCES \`parlays\`(\`uuid\`)
        )`
        )
      )
      .then(() =>
        connection.execute(
          `ALTER TABLE events ADD COLUMN outcome TINYINT(1) NULL`
        )
      )
  );
};

export const revert = ({ connection }: MigrationProps) => {
  return getMysqlConnection(connection).then((connection) =>
    connection
      .execute(`ALTER TABLE events DROP COLUMN outcome`)
      .then(() => connection.execute(`DROP TABLE parlay_results`))
      .then(() => connection.execute(`DROP TABLE parlays`))
  );
};
