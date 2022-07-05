import { v4 } from "uuid";
import getAlgorithmByUuid from "./getAlgorithmByUuid.server";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import uploadFile from "@dvargas92495/app/backend/uploadFile.server";

const MAX_RETRIES = 10000;

const createStrategyParlays = async ({
  data,
  userId,
}: {
  data: Record<string, string[]>;
  userId: string;
}) => {
  const count = Number(data["count"][0]);
  if (count < 1) {
    throw new Response(`Count must be at least 1. Found: ${count}`, {
      status: 400,
    });
  }
  const events = data["events"];
  const max = Math.pow(2, events.length);
  if (count > max) {
    throw new Response(`Count must be at most ${max}. Found: ${count}`, {
      status: 400,
    });
  }

  const algorithm = data["algorithm"][0];
  const label = data["label"][0];
  const { logic } = await getAlgorithmByUuid(algorithm);
  let retries = 0;
  const existingParlays = new Set<number>();
  const results = Array(count)
    .fill(null)
    .map(() => {
      while (retries < MAX_RETRIES) {
        const outcomes = events.map((evt) => {
          return new Function("event", logic)(evt) as boolean;
        });

        const parlay = outcomes.reduce(
          (p, c, i) => (c ? p + Math.pow(2, i) : p),
          0
        );

        if (!existingParlays.has(parlay)) {
          existingParlays.add(parlay);
          return outcomes;
        }
        retries++;
      }
      throw new Response(
        "Reached Maximum Retries - Make a better algorithm you fool!!",
        { status: 400 }
      );
    });
  const uuid = v4();
  const output = {
    results,
    events,
  };
  return getMysqlConnection()
    .then(({ execute, destroy }) => {
      return execute(
        `INSERT INTO strategies (uuid, label, user_id) VALUES (?,?,?)`,
        [uuid, label, userId]
      ).then(() => destroy());
    })
    .then(() => {
      uploadFile({
        Key: `data/strategies/${uuid}.js`,
        Body: JSON.stringify(output),
      });
    })
    .then(() => uuid);
};

export default createStrategyParlays;
