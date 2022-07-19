import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";

const createGameplan = ({
  userId,
  data,
}: {
  userId: string;
  data: Record<string, string[]>;
}) => {
  const label = data.label[0] || "";
  const uuid = v4();
  return getMysqlConnection()
    .then(({ execute, destroy }) => {
      return execute(
        `INSERT INTO gameplans (uuid, label, user_id) VALUES (?,?,?)`,
        [uuid, label, userId]
      ).then(() => destroy());
    })
    .then(() => uuid);
};

export default createGameplan;
