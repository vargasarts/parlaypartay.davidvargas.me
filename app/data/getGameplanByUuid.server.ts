import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import listAlgorithmsByUser from "./listAlgorithmsByUser.server";

const getAlgorithmByUuid = ({
  userId,
  params,
}: {
  userId: string;
  params: Record<string, string | undefined>;
}) => {
  const uuid = params["uuid"] || "";
  return getMysqlConnection().then(({ execute, destroy }) =>
    Promise.all([
      execute(`SELECT label FROM gameplans WHERE uuid = ?`, [uuid]).then(
        (records) => {
          return (records as { label: string }[])[0]?.label;
        }
      ),
      execute(
        `SELECT e.uuid, p.label, p.value FROM events e INNER JOIN event_properties p ON p.event_uuid = e.uuid WHERE gameplan_uuid = ?`,
        [uuid]
      ).then((records) => {
        destroy();
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
      listAlgorithmsByUser({ userId }),
    ]).then(([label, events, algorithms]) => {
      destroy();
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
