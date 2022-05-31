import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import AWS from "aws-sdk";

const createTemplate = ({
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
    .then(({ execute, destroy }) =>
      execute(`INSERT INTO algorithms (uuid, label, user_id) VALUES (?,?,?)`, [
        uuid,
        label,
        userId,
      ]).then(() => destroy())
    )
    .then(() => {
      //   const s3 = new AWS.S3();
      //   s3.upload({
      //       Bucket: process.env.NODE_ENV
      //   })
      //
      // aws-sdk-plus
    });
};

export default createTemplate;
