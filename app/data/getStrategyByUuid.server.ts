import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";

const getParlayByUuid = ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return downloadFileContent({ Key: `data/strategies/${uuid}.js` }).then(
    (data) => JSON.parse(data) as { results: boolean[][]; events: string[] }
  );
};

export default getParlayByUuid;
