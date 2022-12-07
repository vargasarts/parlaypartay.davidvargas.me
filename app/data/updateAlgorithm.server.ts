import getMysqlConnection from "fuegojs/utils/mysql";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";
import type mysql from "mysql2/promise";

export const updateAlgorithmQuery = ({
  userId,
  cxn,
  logic,
  uuid,
}: {
  cxn: mysql.Connection;
  userId: string;
  logic: string;
  uuid: string;
}) => {
  return cxn
    .execute(`SELECT user_id FROM algorithms WHERE uuid = ?`, [uuid])
    .then(([records]) => {
      return (records as { user_id: string }[])[0]?.user_id;
    })
    .then((user_id) => {
      if (userId !== user_id) {
        throw new MethodNotAllowedResponse(
          `User not allowed to update algorithm.`
        );
      }
      return uploadFile({ Key: `data/algorithms/${uuid}.js`, Body: logic });
    });
};

const updateAlgorithm = ({
  userId,
  data,
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  data: Record<string, string[]>;
  params: Record<string, string | undefined>;
}) => {
  const logic = data.logic[0] || "";
  const uuid = params["uuid"] || "";
  return getMysqlConnection(requestId)
    .then((cxn) => updateAlgorithmQuery({ cxn, uuid, logic, userId }))
    .then(() => ({ success: true }));
};

export default updateAlgorithm;
