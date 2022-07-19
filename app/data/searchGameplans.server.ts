import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const searchRevenue = ({
  userId,
  searchParams,
}: {
  userId: string;
  searchParams: Record<string, string>;
}) =>
  getMysqlConnection()
    .then((con) => {
      const keys = Object.keys(searchParams).filter(
        (p) => searchParams[p] && !["size", "index"].includes(p)
      );
      const size = searchParams["size"] || "10";
      const index = searchParams["index"] || "0";
      return Promise.all([
        con
          .execute(
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
          )
          .then((a) => {
            return a;
          }),
        con
          .execute(
            `SELECT COUNT(uuid) as count
            FROM gameplans 
            WHERE user_id = ?`,
            [userId]
          )
          .then((a) => {
            return a as { count: number }[];
          }),
      ]).then((args) => {
        con.destroy();
        return args;
      });
    })
    .then(([a, count]) => {
      const values = a as {
        label: string;
        uuid: string;
      }[];
      return {
        data: values,
        columns: [{ Header: "Label", accessor: "label" }],
        count: count[0].count,
      };
    })
    .catch((e) => {
      console.log("Error!");
      console.log(e);
    });

export default searchRevenue;
