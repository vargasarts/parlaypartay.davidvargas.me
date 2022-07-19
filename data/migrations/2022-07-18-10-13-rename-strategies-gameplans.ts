import type { MigrationProps } from "fuegojs/dist/migrate";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

export const migrate = (args: MigrationProps) => {
  return getMysqlConnection(args.connection).then((cxn) =>
    cxn
      .execute(`RENAME TABLE strategies TO gameplans`)
      .then(() =>
        cxn.execute(
          `ALTER TABLE events RENAME COLUMN strategy_uuid TO gameplan_uuid`
        )
      )
  );
};

export const revert = (args: MigrationProps) => {
  return getMysqlConnection(args.connection).then((cxn) =>
    cxn
      .execute(
        `ALTER TABLE events RENAME COLUMN gameplan_uuid TO strategy_uuid`
      )
      .then(() => cxn.execute(`RENAME TABLE gameplans TO strategies`))
  );
};
