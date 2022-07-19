import { v4 } from "uuid";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import downloadFile from "@dvargas92495/app/backend/downloadFile.server";

const MAX_RETRIES = 10000;

const getLogic = async (algorithm?: string) => {
  try {
    return algorithm
      ? downloadFile({
          Key: `data/algorithms/${algorithm}.js`,
        })
          .then((fil) => {
            const chunks: Buffer[] = [];
            console.log("downloaded file");
            return new Promise<string>((resolve, reject) => {
              fil.on("data", (chunk) => {
                console.log("push chunk");
                chunks.push(Buffer.from(chunk));
              });
              fil.on("error", (err) => {
                console.log("something bad:", err);
                reject(err);
              });
              fil.on("end", () => {
                console.log("resolve end");
                resolve(Buffer.concat(chunks).toString("utf8"));
              });
            });
          })
          .catch(() => "return true")
      : "return true";
  } catch (e) {
    console.error("Failed to get logic", e);
    return "return true";
  }
};

const createGameplanParlays = async ({
  data,
  userId,
  params,
}: {
  params: Record<string, string | undefined>;
  data: Record<string, string[]>;
  userId: string;
}) => {
  console.log("entered create gameplan parlays");
  const count = Number(data["count"][0]);
  const algorithm = data["algorithm"]?.[0];
  const uuid = params["uuid"] || "";
  const customWeightsByEventUuid = Object.fromEntries(
    Object.entries(data)
      .filter(
        ([k, v]) => k.startsWith("custom-") && Number(v) >= 0 && Number(v) <= 1
      )
      .map(([k, v]) => [k.replace(/^custom-/, ""), Number(v)])
  );
  if (count < 1) {
    throw new Response(`Count must be at least 1. Found: ${count}`, {
      status: 400,
    });
  }
  console.log("about to open connections");
  const cxn = await getMysqlConnection();
  const owner = await cxn
    .execute("select user_id from gameplans where uuid = ?", [uuid])
    .then((a) => (a as { user_id: string }[])?.[0]?.user_id);
  const events = await cxn
    .execute("select uuid from events where gameplan_uuid = ?", [uuid])
    .then((a) => (a as { uuid: string }[]).map((a) => a.uuid));
  const max = Math.pow(2, events.length);
  if (count > max) {
    cxn.destroy();
    throw new Response(`Count must be at most ${max}. Found: ${count}`, {
      status: 400,
    });
  }
  if (owner !== userId) {
    cxn.destroy();
    throw new Response(`User is not owner of the currently selected gameplan`, {
      status: 403,
    });
  }

  console.log("inputs look good");
  const logic = await getLogic(algorithm);
  console.log("algo look good");
  let retries = 0;
  const existingParlays = new Set<number>();
  const results = Array(count)
    .fill(null)
    .map((_) => {
      while (retries < MAX_RETRIES) {
        const outcomes = events.map((evt) => {
          if (customWeightsByEventUuid[evt])
            return Math.random() < customWeightsByEventUuid[evt];
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
      cxn.destroy();
      throw new Response(
        "Reached Maximum Retries - Make a better algorithm you fool!!",
        { status: 400 }
      );
    });
  const parlays = results.map((r, a) => ({
    uuid: v4(),
    attempt: a + 1,
    results: r.map((outcome, j) => ({
      uuid: v4(),
      eventUuid: events[j],
      outcome,
    })),
  }));
  console.log("weve built the results");
  await cxn.execute(
    `INSERT INTO parlays (uuid, attempt, gameplan_uuid) VALUES ${parlays
      .map(() => `(?,?,?)`)
      .join(",")}`,
    parlays.flatMap((p) => [p.uuid, p.attempt, uuid])
  );

  console.log("insert1");
  await cxn.execute(
    `INSERT INTO parlay_results (uuid, event_uuid, parlay_uuid, outcome) VALUES ${parlays
      .flatMap((p) => p.results.map(() => `(?,?,?,?)`))
      .join(",")}`,
    parlays.flatMap((p) =>
      p.results.flatMap((r) => [r.uuid, r.eventUuid, p.uuid, Number(r.outcome)])
    )
  );

  console.log("insert 2");
  cxn.destroy();

  console.log("success");
  return { success: true };
};

export default createGameplanParlays;
