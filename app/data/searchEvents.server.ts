import axios from "axios";
import dateParse from "date-fns/parse";
import isBefore from "date-fns/isBefore";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import {
  BadRequestResponse,
  NotFoundResponse,
} from "@dvargas92495/app/backend/responses.server";
import { idByLabel } from "~/enums/eventTypes";

const createEvents = (
  events: {
    uuid: string;
    type: string;
    home: string;
    away: string;
    date: string;
  }[],
  gameplanUuid: string,
  requestId: string
) => {
  if (!events.length) return Promise.resolve();
  return getMysqlConnection(requestId).then(async (cxn) => {
    const offset = await cxn
      .execute(
        `SELECT COUNT(uuid) as count FROM events WHERE gameplan_uuid = ?`,
        [gameplanUuid]
      )
      .then(([a]) => (a as { count: number }[])[0].count);
    await cxn.execute(
      `INSERT INTO events (uuid, type, gameplan_uuid, position) VALUES ${events
        .map(() => `(?,?,?,?)`)
        .join(",")}`,
      events.flatMap((e, i) => [
        e.uuid,
        idByLabel[e.type],
        gameplanUuid,
        i + offset,
      ])
    );
    await cxn.execute(
      `INSERT INTO event_properties (uuid, label, value, event_uuid) VALUES ${events
        .map(() => `(?,?,?,?),(?,?,?,?),(?,?,?,?)`)
        .join(",")}`,
      events.flatMap((e) => [
        v4(),
        "home",
        e.home,
        e.uuid,
        v4(),
        "away",
        e.away,
        e.uuid,
        v4(),
        "date",
        e.date,
        e.uuid,
      ])
    );
    cxn.destroy();
  });
};

const searchEvents = ({
  data,
  params,
  context: { requestId },
}: {
  context: { requestId: string };
  data: Record<string, string[]>;
  params: Record<string, string | undefined>;
}) => {
  const method = data["method"][0];
  const gameplanUuid = params["uuid"] || "";
  if (method === "search") {
    const sport = data["sport"][0];
    const start = data["start"][0];
    const end = data["end"][0];
    const startDate = dateParse(start, "yyyy-MM-dd", new Date());
    const endDate = dateParse(end, "yyyy-MM-dd", new Date());
    return axios
      .get<
        {
          away_team: string;
          home_team: string;
          id: string;
          commence_time: string;
        }[]
      >(
        `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&oddsFormat=american&apiKey=${process.env.ODDS_API_KEY}&sport=${sport}`
      )
      .catch((r) => {
        return Promise.reject(r.response.data);
      })
      .then((r) => {
        const events = r.data
          .filter((d) => {
            const date = new Date(d.commence_time);
            return isBefore(date, endDate) && isBefore(startDate, date);
          })
          .map((e) => ({
            type: "Money Line",
            away: e.away_team,
            home: e.home_team,
            uuid: v4(),
            date: e.commence_time,
          }));
        return createEvents(events, gameplanUuid, requestId).then(() => ({
          events,
          startDate,
          endDate,
        }));
      });
  } else if (method === "create") {
    const home = data["home"][0];
    const away = data["away"][0];
    const date = data["date"][0];
    const events = [{ uuid: v4(), home, away, type: "Money Line", date }];
    return createEvents(events, gameplanUuid, requestId).then(() => events);
  } else if (method === "reorder") {
    const oldIndex = Number(data["oldIndex"][0]);
    const newIndex = Number(data["newIndex"][0]);
    if (oldIndex === newIndex) return Promise.resolve({ success: true });
    return getMysqlConnection(requestId).then(async (cxn) => {
      const uuidToUpdate = await cxn
        .execute(
          "SELECT uuid from events WHERE gameplan_uuid = ? AND position = ?",
          [gameplanUuid, oldIndex]
        )
        .then(([a]) => (a as { uuid: string }[])[0]?.uuid);

      if (!uuidToUpdate) {
        cxn.destroy();
        throw new NotFoundResponse(
          `Could not find event at position: ${oldIndex} for gameplan: ${gameplanUuid}`
        );
      }
      if (newIndex > oldIndex) {
        await cxn.execute(
          "UPDATE events SET position = position - 1 WHERE gameplan_uuid = ? AND position > ? AND position <= ?",
          [gameplanUuid, oldIndex, newIndex]
        );
      } else {
        await cxn.execute(
          "UPDATE events SET position = position + 1 WHERE gameplan_uuid = ? AND position < ? AND position >= ?",
          [gameplanUuid, oldIndex, newIndex]
        );
      }
      await cxn.execute("UPDATE events SET position = ? WHERE uuid = ?", [
        newIndex,
        uuidToUpdate,
      ]);
      cxn.destroy();
      return { success: true };
    });
  }
  throw new BadRequestResponse(`Unknown method: ${method}`);
};

export default searchEvents;
