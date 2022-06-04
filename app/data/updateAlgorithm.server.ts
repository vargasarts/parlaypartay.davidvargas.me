import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";

const updateAlgorithm = ({
  userId,
  data,
  params,
}: {
  userId: string;
  data: Record<string, string[]>;
  params: Record<string, string | undefined>;
}) => {
  const logic = data.logic[0] || "";
  const uuid = params["uuid"] || "";
  return getMysqlConnection()
    .then(({ execute, destroy }) =>
      execute(`SELECT user_id FROM algorithms WHERE uuid = ?`, [uuid]).then(
        (records) => {
          destroy();
          return (records as { user_id: string }[])[0]?.user_id;
        }
      )
    )
    .then((user_id) => {
      if (userId !== user_id) {
        throw new MethodNotAllowedResponse(
          `User not allowed to update algorithm.`
        );
      }
      return uploadFile({ Key: `data/algorithms/${uuid}.js`, Body: logic });
    })
    .then(() => ({ success: true }));
};

export default updateAlgorithm;
