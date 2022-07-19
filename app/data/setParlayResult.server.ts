import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const setParlayResult = ({ data }: { data: Record<string, string[]> }) => {
  const [[uuid, [outcome]]] = Object.entries(data);
  return getMysqlConnection()
    .then((cxn) =>
      cxn
        .execute(`UPDATE events SET outcome = ? where uuid = ?`, [
          outcome === "reset" ? null : Number(outcome === "true"),
          uuid,
        ])
        .then(() => cxn.destroy())
    )
    .then(() => ({ success: true }));
};

export default setParlayResult;
