import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { MethodNotAllowedResponse } from "@dvargas92495/app/backend/responses.server";

const deleteEvent = ({
  userId,
  data,
}: {
  userId: string;
  data: Record<string, string[]>;
}) => {
  const eventUuid = data["uuid"]?.[0] || "";
  return getMysqlConnection()
    .then(({ execute, destroy }) =>
      execute(
        `SELECT s.user_id FROM events e INNER JOIN strategies s ON s.uuid = e.strategy_uuid WHERE e.uuid = ?`,
        [eventUuid]
      )
        .then((records) => {
          console.log(records)
          return (records as { user_id: string }[])[0]?.user_id;
        })
        .then((user_id) => {
          if (userId !== user_id) {
            throw new MethodNotAllowedResponse(
              `User not allowed to delete event.`
            );
          }

          return execute(`DELETE FROM event_properties WHERE event_uuid = ?`, [
            eventUuid,
          ])
            .then(() =>
              execute(`DELETE FROM events WHERE uuid = ?`, [eventUuid])
            )
            .then(() => destroy());
        })
    )
    .then(() => ({
      success: true,
      message: "Successfully removed event",
      uuid: eventUuid,
    }));
};

export default deleteEvent;
