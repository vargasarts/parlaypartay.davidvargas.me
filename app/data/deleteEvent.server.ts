import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";

const deleteEvent = ({
  userId,
  data,
  context: { requestId },
}: {
  context: { requestId: string };
  userId: string;
  data: Record<string, string[]>;
}) => {
  const eventUuid = data["uuid"]?.[0] || "";
  return getMysqlConnection(requestId)
    .then((cxn) =>
      cxn.execute(
        `SELECT s.user_id FROM events e INNER JOIN gameplans s ON s.uuid = e.gameplan_uuid WHERE e.uuid = ?`,
        [eventUuid]
      )
        .then(([records]) => {
          return (records as { user_id: string }[])[0]?.user_id;
        })
        .then((user_id) => {
          if (userId !== user_id) {
            throw new MethodNotAllowedResponse(
              `User not allowed to delete event.`
            );
          }

          return cxn.execute(`DELETE FROM event_properties WHERE event_uuid = ?`, [
            eventUuid,
          ])
            .then(() =>
              cxn.execute(`DELETE FROM events WHERE uuid = ?`, [eventUuid])
            )
            .then(() => cxn.destroy());
        })
    )
    .then(() => ({
      success: true,
      message: "Successfully removed event",
      uuid: eventUuid,
    }));
};

export default deleteEvent;
