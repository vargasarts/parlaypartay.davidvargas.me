import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";

const getGameplanParlaysByUuid = ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return downloadFileContent({ Key: `data/gameplans/${uuid}.json` }).then(
    (data) => JSON.parse(data) as { results: boolean[][]; events: string[] }
  );
};

export default getGameplanParlaysByUuid;
