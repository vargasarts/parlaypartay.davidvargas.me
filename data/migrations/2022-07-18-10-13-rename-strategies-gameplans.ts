import type { MigrationProps } from "fuegojs/dist/migrate";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

export const migrate = (args: MigrationProps) => {
  return getMysqlConnection(args.connection).then((cxn) =>
    cxn
      .execute(`RENAME TABLE strategies TO gameplans`)
      .then(() =>
        cxn.execute(
          `ALTER TABLE events CHANGE COLUMN strategy_uuid gameplan_uuid VARCHAR(36) NOT NULL`
        )
      )
  );
};

export const revert = (args: MigrationProps) => {
  return getMysqlConnection(args.connection).then((cxn) =>
    cxn
      .execute(
        `ALTER TABLE events CHANGE COLUMN gameplan_uuid strategy_uuid VARCHAR(36) NOT NULL`
      )
      .then(() => cxn.execute(`RENAME TABLE gameplans TO strategies`))
  );
};
