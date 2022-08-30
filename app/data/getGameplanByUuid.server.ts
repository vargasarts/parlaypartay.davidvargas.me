import { downloadFileContent } from "@dvargas92495/app/backend/downloadFile.server";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { listAlgorithmsByUserQuery } from "./listAlgorithmsByUser.server";

const getAlgorithmByUuid = ({
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
          `SELECT e.uuid, p.label, p.value FROM events e INNER JOIN event_properties p ON p.event_uuid = e.uuid WHERE gameplan_uuid = ?`,
          [uuid]
        )
        .then(([records]) => {
          return (
            records as { label: string; uuid: string; value: string }[]
          ).reduce((p, c) => {
            if (p[c.uuid]) {
              p[c.uuid][c.label] = c.value;
            } else {
              p[c.uuid] = { [c.label]: c.value };
            }
            return p;
          }, {} as Record<string, Record<string, string>>);
        }),
      listAlgorithmsByUserQuery(cxn, userId),
    ]).then(
      async ([
        { label, algorithm_uuid, algorithm, custom },
        events,
        algorithms,
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
          algorithms: [
            algorithm
              ? { id: algorithm_uuid, label: algorithm }
              : { id: "custom", label: "Custom" },
          ].concat(algorithms.data),
          events: Object.entries(events).map(([uuid, rest]) => ({
            uuid,
            home: rest["home"],
            away: rest["away"],
          })),
        };
      }
    )
  );
};

export default getAlgorithmByUuid;
