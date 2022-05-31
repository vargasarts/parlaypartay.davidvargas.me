import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const listAlgorithmsByUser = ({ userId }: { userId: string }) => {
  return getMysqlConnection().then((cxn) =>
    cxn
      .execute(`SELECT uuid, label FROM algorithms WHERE user_id = ?`, [userId])
      .then((records) => {
        cxn.destroy();
        return {
          data: (records as { uuid: string; label: string }[]).map((r) => ({
            id: r.uuid,
            label: r.label,
          })),
          columns: [{ Header: "Label", accessor: "label" }],
        };
      })
  );
};

export default listAlgorithmsByUser;
