import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";
import nodepath from "path";
import fs from "fs";

const createAlgorithm = ({
  userId,
  data,
}: {
  userId: string;
  data: Record<string, string[]>;
}) => {
  const label = data.label[0] || "";
  const logic = data.logic[0] || "";
  const uuid = v4();
  return getMysqlConnection()
    .then(({ execute, destroy }) => {
      return execute(
        `INSERT INTO algorithms (uuid, label, user_id) VALUES (?,?,?)`,
        [uuid, label, userId]
      ).then(() => destroy());
    })
    .then(() => {
      console.log("upl");
      const Key = `data/algorithms/${uuid}.js`;
      const dir = nodepath.dirname(Key);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      uploadFile({ Key: `data/algorithms/${uuid}.js`, Body: logic });
    })
    .then(() => uuid);
};

export default createAlgorithm;
