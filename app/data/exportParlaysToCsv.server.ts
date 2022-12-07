import getMysqlConnection from "fuegojs/utils/mysql";

const exportParlaysToCsv = async ({
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  const cxn = await getMysqlConnection(requestId);
  const parlays = await cxn
    .execute(
      `SELECT p.uuid, p.attempt, r.outcome, r.event_uuid from parlays p 
    INNER JOIN parlay_results r ON r.parlay_uuid = p.uuid
    WHERE p.gameplan_uuid = ?`,
      [uuid]
    )
    .then(
      ([p]) =>
        p as {
          uuid: string;
          outcome: 0 | 1;
          event_uuid: string;
          attempt: number;
        }[]
    );
  const events = await cxn
    .execute(
      `SELECT e.uuid, ep.label, ep.value, e.position from events e
    INNER JOIN event_properties ep ON ep.event_uuid = e.uuid 
    WHERE e.gameplan_uuid = ?`,
      [uuid]
    )
    .then(
      ([p]) =>
        p as {
          uuid: string;
          label: string;
          value: string;
          position: number;
        }[]
    );
  const title = await cxn
    .execute(
      `SELECT g.label from gameplans g
      WHERE g.uuid = ?`,
      [uuid]
    )
    .then(
      ([p]) =>
        (
          p as {
            label: string;
          }[]
        )[0]?.label
    );
  cxn.destroy();
  const groupedEvents = events.reduce((p, c) => {
    if (p[c.uuid]) {
      p[c.uuid].properties[c.label] = c.value;
    } else {
      p[c.uuid] = {
        properties: { [c.label]: c.value },
        position: c.position,
      };
    }
    return p;
  }, {} as Record<string, { properties: Record<string, string>; position: number }>);
  return {
    parlays: `Parlay,Winner,Loser\n${parlays
      .sort((a, b) =>
        a.attempt === b.attempt
          ? groupedEvents[a.event_uuid].position -
            groupedEvents[b.event_uuid].position
          : a.attempt - b.attempt
      )
      .map((p) => ({
        parlay: p.attempt,
        winner: p.outcome
          ? groupedEvents[p.event_uuid].properties.home
          : groupedEvents[p.event_uuid].properties.away,
        loser: p.outcome
          ? groupedEvents[p.event_uuid].properties.away
          : groupedEvents[p.event_uuid].properties.home,
      }))
      .map((p) => `${p.parlay},${p.winner},${p.loser}`)
      .join("\n")}\n\n`,
    title,
  };
};

export default exportParlaysToCsv;
