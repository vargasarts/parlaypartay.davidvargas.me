import { v4 } from "uuid";
import fs from "fs";
import getAlgorithmByUuid from "./getAlgorithmByUuid.server";

const MAX_RETRIES = 10000;

const createStrategy = async ({ data }: { data: Record<string, string[]> }) => {
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
  const logic = getAlgorithmByUuid(algorithm);
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
  fs.writeFileSync(`public/data/${uuid}.json`, JSON.stringify(output));
  return Promise.resolve(uuid);
};

export default createStrategy;
