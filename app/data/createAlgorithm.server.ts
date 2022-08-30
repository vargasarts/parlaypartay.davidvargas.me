import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";
import type mysql from "mysql2/promise";

export const createAlgorithmQuery = ({
  cxn,
  label,
  userId,
  logic,
  isCustom = false,
}: {
  label: string;
  logic: string;
  userId: string;
  cxn: mysql.Connection;
  isCustom?: boolean,
}) => {
  const uuid = v4();
  return cxn
    .execute(`INSERT INTO algorithms (uuid, label, user_id, custom) VALUES (?,?,?,?)`, [
      uuid,
      label,
      userId,
      isCustom,
    ])
    .then(() => {
      uploadFile({ Key: `data/algorithms/${uuid}.js`, Body: logic });
    })
    .then(() => uuid);
};

const createAlgorithm = ({
  userId,
  data,
  requestId,
}: {
  userId: string;
  data: Record<string, string[]>;
  requestId: string;
}) => {
  const label = data.label[0] || "";
  const logic = data.logic[0] || "";
  return getMysqlConnection(requestId).then((cxn) => {
    return createAlgorithmQuery({ label, logic, cxn, userId }).then((uuid) => {
      cxn.destroy();
      return uuid;
    });
  });
};

export default createAlgorithm;
