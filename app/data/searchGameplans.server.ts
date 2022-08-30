import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const searchGameplans = ({
  userId,
  searchParams,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  searchParams: Record<string, string>;
}) =>
  getMysqlConnection(requestId)
    .then((con) => {
      const keys = Object.keys(searchParams).filter(
        (p) => searchParams[p] && !["size", "index"].includes(p)
      );
      const size = searchParams["size"] || "10";
      const index = searchParams["index"] || "0";
      return Promise.all([
        con.execute(
          `SELECT uuid, label
          FROM gameplans 
          WHERE ${["user_id"]
            .concat(keys)
            .map((k) => `${k} = ?`)
            .join(" AND ")}
          LIMIT ?, ?`,
          [userId]
            .concat(keys.map((k) => searchParams[k]))
            .concat(
              [Number(index) * Number(size), size].map((n) => n.toString())
            )
        ),
        con
          .execute(
            `SELECT COUNT(uuid) as count
            FROM gameplans 
            WHERE user_id = ?`,
            [userId]
          )
          .then(([a]) => {
            return a as { count: number }[];
          }),
      ]).then(([[a], count]) => {
        con.destroy();
        const values = a as {
          label: string;
          uuid: string;
        }[];
        return {
          data: values,
          columns: [{ Header: "Label", accessor: "label" }],
          count: count[0].count,
        };
      });
    })
    .catch((e) => {
      console.log("Error!");
      console.log(e);
    });

export default searchGameplans;
