import getMysqlConnection from "fuegojs/utils/mysql";
import type mysql from "mysql2/promise";

export const listAlgorithmsByUserQuery = (
  cxn: mysql.Connection,
  userId: string
) =>
  cxn
    .execute(
      `SELECT uuid, label FROM algorithms WHERE user_id = ? AND custom = 0`,
      [userId]
    )
    .then(([records]) => {
      return {
        data: (records as { uuid: string; label: string }[]).map((r) => ({
          id: r.uuid,
          label: r.label,
        })),
      };
    });

const listAlgorithmsByUser = ({
  userId,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
}) => {
  return getMysqlConnection(requestId).then((cxn) =>
    listAlgorithmsByUserQuery(cxn, userId).then(({ data }) => {
      cxn.destroy();
      return {
        data,
        columns: [{ Header: "Label", accessor: "label" }],
      };
    })
  );
};

export default listAlgorithmsByUser;
