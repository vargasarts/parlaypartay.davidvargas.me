import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";

const getAlgorithmByUuid = (uuid: string) => {
  return Promise.all([
    getMysqlConnection().then(({ execute, destroy }) =>
      execute(`SELECT label FROM algorithms WHERE uuid = ?`, [uuid]).then(
        (records) => {
          destroy();
          return (records as { label: string }[])[0]?.label;
        }
      )
    ),
    downloadFileContent({ Key: `data/algorithms/${uuid}.js` }),
  ]).then(([label, logic]) => ({ label, logic }));
};

export default getAlgorithmByUuid;
