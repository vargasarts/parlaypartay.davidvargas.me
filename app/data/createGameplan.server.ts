import getMysqlConnection from "fuegojs/utils/mysql";
import { v4 } from "uuid";

const createGameplan = ({
  userId,
  data,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  data: Record<string, string[]>;
}) => {
  const label = data.label[0] || "";
  const uuid = v4();
  return getMysqlConnection(requestId)
    .then((cxn) => {
      return cxn
        .execute(
          `INSERT INTO gameplans (uuid, label, user_id) VALUES (?,?,?)`,
          [uuid, label, userId]
        )
        .then(() => cxn.destroy());
    })
    .then(() => uuid);
};

export default createGameplan;
