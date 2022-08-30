import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";

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
  const uuid = v4();
  return getMysqlConnection(requestId)
    .then((cxn) => {
      return cxn.execute(
        `INSERT INTO algorithms (uuid, label, user_id) VALUES (?,?,?)`,
        [uuid, label, userId]
      ).then(() => cxn.destroy());
    })
    .then(() => {
      uploadFile({ Key: `data/algorithms/${uuid}.js`, Body: logic });
    })
    .then(() => uuid);
};

export default createAlgorithm;
