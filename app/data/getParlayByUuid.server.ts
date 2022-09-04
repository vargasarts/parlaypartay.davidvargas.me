import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";

const getParlayByUuid = async ({
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  params: Record<string, string | undefined>;
}) => {
  const cxn = await getMysqlConnection(requestId);
  const results = await cxn
    .execute(
      `SELECT p.attempt, pr.outcome, e.type, e.uuid, ep.label, ep.value, e.outcome as eoutcome, e.position FROM parlays p 
    INNER JOIN parlay_results pr ON pr.parlay_uuid = p.uuid 
    INNER JOIN events e ON pr.event_uuid = e.uuid 
    INNER JOIN event_properties ep ON ep.event_uuid = e.uuid 
    WHERE p.uuid = ?`,
      [params["parlay"]]
    )
    .then(
      ([records]) =>
        records as {
          outcome: boolean;
          type: number;
          uuid: string;
          label: string;
          value: string;
          attempt: string;
          eoutcome: boolean | null;
          position: number;
        }[]
    );
  cxn.destroy();
  const events = results.reduce((p, c) => {
    if (p[c.uuid]) {
      p[c.uuid].properties[c.label] = c.value;
    } else {
      p[c.uuid] = {
        properties: { [c.label]: c.value },
        type: c.type,
        prediction: c.outcome,
        outcome: c.eoutcome,
      };
    }
    return p;
  }, {} as Record<string, { properties: Record<string, string>; type: number; prediction: boolean; outcome: boolean | null }>);
  const positions = Object.entries(
    Object.fromEntries(results.map((e) => [e.uuid, e.position]))
  )
    .sort((a, b) => a[1] - b[1])
    .map((a) => a[0]);
  return {
    events: positions.map((uuid) => ({ uuid, ...events[uuid] })),
    attempt: results[0].attempt,
  };
};

export default getParlayByUuid;
