import getMysqlConnection from "fuegojs/utils/mysql";
import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";

const getAlgorithmByUuid = (uuid: string, requestId: string) => {
  return Promise.all([
    getMysqlConnection(requestId)
      .then((cxn) =>
        cxn
          .execute(`SELECT label FROM algorithms WHERE uuid = ?`, [uuid])
          .then(([records]) => {
            cxn.destroy();
            return (records as { label: string }[])[0]?.label;
          })
      )
      .catch((e) =>
        Promise.reject(`Failed to retrieve label from algorithm: ${e.message}`)
      ),
    downloadFileContent({ Key: `data/algorithms/${uuid}.js` }).catch((e) =>
      Promise.reject(`Failed to retrieve algorithm content: ${e.message}`)
    ),
  ])
    .then(([label, logic]) => ({ label, logic }))
    .catch((e) => {
      console.error(e);
      return { label: "Unknown Error", logic: "return true" };
    });
};

export default getAlgorithmByUuid;
