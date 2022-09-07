import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const getGameplanParlaysByUuid = async ({
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
      `SELECT e.uuid, e.outcome, ep.label, ep.value, e.position from events e
    INNER JOIN event_properties ep ON ep.event_uuid = e.uuid 
    WHERE e.gameplan_uuid = ?`,
      [uuid]
    )
    .then(
      ([p]) =>
        p as {
          uuid: string;
          outcome: 0 | 1 | null;
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
  const grouped = parlays.reduce((p, c) => {
    if (p[c.uuid]) {
      p[c.uuid].results[c.event_uuid] = c.outcome;
    } else {
      p[c.uuid] = {
        results: { [c.event_uuid]: c.outcome },
        attempt: c.attempt,
      };
    }
    return p;
  }, {} as Record<string, { results: Record<string, 0 | 1>; attempt: number }>);
  const groupedEvents = events.reduce((p, c) => {
    if (p[c.uuid]) {
      p[c.uuid].properties[c.label] = c.value;
    } else {
      p[c.uuid] = {
        properties: { [c.label]: c.value },
        outcome: c.outcome === null ? undefined : Boolean(c.outcome),
        position: c.position,
      };
    }
    return p;
  }, {} as Record<string, { properties: Record<string, string>; outcome: boolean | undefined; position: number }>);
  const eventOutcomes = Object.fromEntries(
    events.map((e) => [e.uuid, e.outcome])
  );
  return {
    data: Object.entries(grouped)
      .map(([uuid, rest]) => ({
        uuid,
        ...rest,
        correct: Object.keys(rest.results).filter(
          (r) =>
            eventOutcomes[r] !== null &&
            Number(eventOutcomes[r]) === rest.results[r]
        ).length,
        wrong: Object.keys(rest.results).filter(
          (r) =>
            eventOutcomes[r] !== null &&
            Number(eventOutcomes[r]) !== rest.results[r]
        ).length,
        left: Object.keys(rest.results).filter((r) => eventOutcomes[r] === null)
          .length,
      }))
      .sort((a, b) =>
        b.correct === a.correct ? a.attempt - b.attempt : b.correct - a.correct
      ),
    columns: [
      { Header: "Attempt", accessor: "attempt" },
      { Header: "Correct", accessor: "correct" },
      { Header: "Wrong", accessor: "wrong" },
      { Header: "Left", accessor: "left" },
    ],
    events: Object.entries(groupedEvents)
      .sort((a, b) => a[1].position - b[1].position)
      .map(([uuid, { properties, outcome }]) => ({
        uuid,
        properties,
        outcome,
      })),
    title,
  };
};

export default getGameplanParlaysByUuid;
