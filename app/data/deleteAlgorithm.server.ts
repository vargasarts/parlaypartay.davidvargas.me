import getMysqlConnection from "fuegojs/utils/mysql";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";
import removeFile from "@dvargas92495/app/backend/removeFile.server";
import fs from "fs";

const deleteAlgorithm = ({
  userId,
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return getMysqlConnection(requestId)
    .then((cxn) =>
      cxn
        .execute(`SELECT user_id FROM algorithms WHERE uuid = ?`, [uuid])
        .then(([records]) => {
          return (records as { user_id: string }[])[0]?.user_id;
        })
        .then((user_id) => {
          if (userId !== user_id) {
            throw new MethodNotAllowedResponse(
              `User not allowed to delete algorithm.`
            );
          }

          return (
            fs.existsSync(`data/algorithms/${uuid}.js`)
              ? removeFile({ Key: `data/algorithms/${uuid}.js` })
              : Promise.resolve()
          )
            .then(() =>
              cxn.execute(`DELETE FROM algorithms WHERE uuid = ?`, [uuid])
            )
            .then(() => cxn.destroy());
        })
    )
    .then(() => ({ success: true }));
};

export default deleteAlgorithm;
