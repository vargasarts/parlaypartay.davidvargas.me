import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";
import removeFile from "@dvargas92495/app/backend/removeFile.server";
import fs from "fs";

const deleteAlgorithm = ({
  userId,
  params,
}: {
  userId: string;
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return getMysqlConnection()
    .then(({ execute, destroy }) =>
      execute(`SELECT user_id FROM algorithms WHERE uuid = ?`, [uuid])
        .then((records) => {
          return (records as { user_id: string }[])[0]?.user_id;
        })
        .then((user_id) => {
          if (userId !== user_id) {
            throw new MethodNotAllowedResponse(
              `User not allowed to delete algorithm.`
            );
          }

          return (fs.existsSync(`data/algorithms/${uuid}.js`)
            ? removeFile({ Key: `data/algorithms/${uuid}.js` })
            : Promise.resolve()
          )
            .then(() =>
              execute(`DELETE FROM algorithms WHERE uuid = ?`, [uuid])
            )
            .then(() => destroy());
        })
    )
    .then(() => ({ success: true }));
};

export default deleteAlgorithm;
