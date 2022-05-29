import fs from "fs";

const getParlayByUuid = ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  const output = JSON.parse(
    fs.readFileSync(`public/data/${uuid}.json`).toString()
  ) as { results: boolean[][]; events: string[] };
  return output;
};

export default getParlayByUuid;
