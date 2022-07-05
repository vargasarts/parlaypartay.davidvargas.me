import axios from "axios";
import dateParse from "date-fns/parse";
import isBefore from "date-fns/isBefore";
import getMysqlConnection from "@dvargas92495/app/backend/mysql.server";
import { v4 } from "uuid";
import { BadRequestResponse } from "@dvargas92495/app/backend/responses.server";
import { idByLabel } from "~/enums/eventTypes";

const createEvents = (
  events: { uuid: string; type: string; home: string; away: string }[],
  strategyUuid: string
) => {
  console.log(events);
  return getMysqlConnection().then((cxn) =>
    cxn
      .execute(
        `INSERT INTO events (uuid, type, strategy_uuid) VALUES ${events
          .map(() => `(?,?,?)`)
          .join(",")}`,
        events.flatMap((e) => [e.uuid, idByLabel[e.type], strategyUuid])
      )
      .then(() =>
        cxn.execute(
          `INSERT INTO event_properties (uuid, label, value, event_uuid) VALUES ${events
            .map(() => `(?,?,?,?),(?,?,?,?)`)
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
          ])
        )
      )
      .then(() => cxn.destroy())
  );
};

const searchEvents = ({
  data,
  params,
}: {
  data: Record<string, string[]>;
  params: Record<string, string | undefined>;
}) => {
  const method = data["method"][0];
  const strategyUuid = params["uuid"] || "";
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
          }));
        return createEvents(events, strategyUuid).then(() => events);
      });
  } else if (method === "create") {
    const home = data["home"][0];
    const away = data["away"][0];
    const events = [{ uuid: v4(), home, away, type: "Money Line" }];
    return createEvents(events, strategyUuid).then(() => events);
  }
  throw new BadRequestResponse(`Unknown method: ${method}`);
};

export default searchEvents;
