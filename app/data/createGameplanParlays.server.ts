import { v4 } from "uuid";
import getMysqlConnection from "fuegojs/utils/mysql";
import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";
import { createAlgorithmQuery } from "./createAlgorithm.server";

const MAX_RETRIES = 10000;
const fact = (index: number) =>
  Array(index)
    .fill(null)
    .reduce((p, _, i) => p * (i + 1), 1);

const createGameplanParlays = async ({
  data,
  userId,
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  params: Record<string, string | undefined>;
  data: Record<string, string[]>;
  userId: string;
}) => {
  const count = Number(data["count"][0]);
  const algorithm = data["algorithm"]?.[0];
  const uuid = params["uuid"] || "";
  if (count < 1) {
    throw new Response(`Count must be at least 1. Found: ${count}`, {
      status: 400,
    });
  }
  const cxn = await getMysqlConnection(requestId);
  const { user_id: owner, label } = await cxn
    .execute("select user_id, label from gameplans where uuid = ?", [uuid])
    .then(([a]) => (a as { user_id: string; label: string }[])?.[0]);
  const events = await cxn
    .execute("select uuid from events where gameplan_uuid = ?", [uuid])
    .then(([a]) => (a as { uuid: string }[]).map((a) => a.uuid));
  const minUpsets = Number(data["min-upsets"]?.[0]) || 1;
  const maxUpsets = Number(data["max-upsets"]?.[0]) || events.length;
  if (maxUpsets <= minUpsets) {
    cxn.destroy();
    throw new Response(
      `Max upsets must be greater than min upsets. Found: max ${maxUpsets}, min ${minUpsets}`,
      {
        status: 400,
      }
    );
  }
  const max = Array(maxUpsets - minUpsets)
    .fill(null)
    .reduce(
      (p, _, i) =>
        p +
        fact(events.length) /
          (fact(i + minUpsets) * fact(events.length - i - minUpsets)),
      0
    );
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

  const { logic, algorithmUuid, upsets } = await (algorithm === "custom"
    ? Promise.resolve(
        `const weights = ${JSON.stringify(
          Object.fromEntries(
            Object.entries(data)
              .filter(
                ([k, v]) =>
                  k.startsWith("custom-") && Number(v) >= 0 && Number(v) <= 1
              )
              .map(([k, v]) => [k.replace(/^custom-/, ""), Number(v)])
          ),
          null,
          4
        )};
return Math.random() < weights[event];`
      ).then((logic) =>
        createAlgorithmQuery({
          logic,
          userId,
          label: `Custom for ${label} (${new Date().toLocaleString()})`,
          cxn,
          isCustom: true,
        }).then((algorithmUuid) => ({
          algorithmUuid,
          logic,
          upsets: (uuid: string) => Number(data[`custom-${uuid}`]) < 0.5,
        }))
      )
    : // no longer allowing arbitrary user algorithms
      await cxn
        .execute("select custom from algoritms where where = ?", [algorithm])
        .then(([a]) => (a as { custom: 0 | 1 }[]).map((a) => a.custom))
        .then((al) =>
          al[0]
            ? downloadFileContent({
                Key: `data/algorithms/${algorithm}.js`,
              })
            : `return false`
        )
        .then((logic) => ({
          logic,
          algorithmUuid: algorithm,
          upsets: () => false,
        })));
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
          const numUpsets = events.filter(
            (e, i) => upsets(e) === outcomes[i]
          ).length;
          if (numUpsets <= maxUpsets && numUpsets >= minUpsets) {
            return outcomes;
          }
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

  await cxn.execute(
    `DELETE pr FROM parlay_results pr 
    INNER JOIN parlays p ON p.uuid = pr.parlay_uuid 
    WHERE p.gameplan_uuid = ?`,
    [uuid]
  );

  await cxn.execute(
    `DELETE FROM parlays 
    WHERE gameplan_uuid = ?`,
    [uuid]
  );

  await cxn.execute(
    `INSERT INTO parlays (uuid, attempt, gameplan_uuid) VALUES ${parlays
      .map(() => `(?,?,?)`)
      .join(",")}`,
    parlays.flatMap((p) => [p.uuid, p.attempt, uuid])
  );

  await cxn.execute(
    `INSERT INTO parlay_results (uuid, event_uuid, parlay_uuid, outcome) VALUES ${parlays
      .flatMap((p) => p.results.map(() => `(?,?,?,?)`))
      .join(",")}`,
    parlays.flatMap((p) =>
      p.results.flatMap((r) => [r.uuid, r.eventUuid, p.uuid, Number(r.outcome)])
    )
  );

  await cxn.execute(`UPDATE gameplans SET algorithm_uuid = ? WHERE uuid = ?`, [
    algorithmUuid,
    uuid,
  ]);

  cxn.destroy();

  return { success: true };
};

export default createGameplanParlays;
