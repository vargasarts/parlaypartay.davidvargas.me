import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";
import getMysqlConnection from "fuegojs/utils/mysql";
import { listAlgorithmsByUserQuery } from "./listAlgorithmsByUser.server";

const getGameplanByUuid = ({
  userId,
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return getMysqlConnection(requestId).then((cxn) =>
    Promise.all([
      cxn
        .execute(
          `SELECT g.label, g.algorithm_uuid, a.label as algorithm, a.custom
        FROM gameplans g
        LEFT JOIN algorithms a ON a.uuid = g.algorithm_uuid 
        WHERE g.uuid = ?`,
          [uuid]
        )
        .then(([records]) => {
          return (
            records as {
              label: string;
              algorithm_uuid: string;
              algorithm: string;
              custom: 0 | 1;
            }[]
          )[0];
        }),
      cxn
        .execute(
          `SELECT e.uuid, p.label, p.value, e.position 
          FROM events e 
          INNER JOIN event_properties p ON p.event_uuid = e.uuid 
          WHERE gameplan_uuid = ?`,
          [uuid]
        )
        .then(([records]) => {
          const events = records as {
            label: string;
            uuid: string;
            value: string;
            position: number;
          }[];
          return {
            properties: events.reduce((p, c) => {
              if (p[c.uuid]) {
                p[c.uuid][c.label] = c.value;
              } else {
                p[c.uuid] = { [c.label]: c.value };
              }
              return p;
            }, {} as Record<string, Record<string, string>>),
            positions: Object.entries(
              Object.fromEntries(events.map((e) => [e.uuid, e.position]))
            )
              .sort((a, b) => a[1] - b[1])
              .map((a) => a[0]),
          };
        }),
      listAlgorithmsByUserQuery(cxn, userId),
      cxn
        .execute(
          `SELECT COUNT(uuid) as count FROM parlays WHERE gameplan_uuid = ?`,
          [uuid]
        )
        .then(([a]) => (a as { count: number }[])[0].count),
    ]).then(
      async ([
        { label, algorithm_uuid, algorithm, custom },
        events,
        algorithms,
        parlayCount,
      ]) => {
        cxn.destroy();
        const customValues = custom
          ? await downloadFileContent({
              Key: `data/algorithms/${algorithm_uuid}.js`,
            }).then((c) =>
              JSON.parse(c.slice(c.indexOf("{"), c.indexOf("}") + 1))
            )
          : undefined;
        return {
          customValues,
          label,
          algorithmUuid: algorithm_uuid,
          algorithms: (custom && algorithm
            ? [{ id: algorithm_uuid, label: algorithm }]
            : []
          )
            .concat({ id: "custom", label: "Custom" })
            .concat(algorithms.data),
          events: events.positions.map((uuid) => ({
            uuid,
            home: events.properties[uuid]["home"],
            away: events.properties[uuid]["away"],
            date: events.properties[uuid]["date"],
          })),
          hasParlays: parlayCount > 0,
        };
      }
    )
  );
};

export default getGameplanByUuid;
