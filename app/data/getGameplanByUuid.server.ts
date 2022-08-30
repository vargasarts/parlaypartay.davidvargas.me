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
      cxn.execute(`SELECT label FROM gameplans WHERE uuid = ?`, [uuid]).then(
        ([records]) => {
          return (records as { label: string }[])[0]?.label;
        }
      ),
      cxn.execute(
        `SELECT e.uuid, p.label, p.value FROM events e INNER JOIN event_properties p ON p.event_uuid = e.uuid WHERE gameplan_uuid = ?`,
        [uuid]
      ).then(([records]) => {
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
    ]).then(([label, events, algorithms]) => {
      cxn.destroy();
      return {
        label,
        algorithms,
        events: Object.entries(events).map(([uuid, rest]) => ({
          uuid,
          home: rest["home"],
          away: rest["away"],
        })),
      };
    })
  );
};

export default getAlgorithmByUuid;
