import axios from "axios";
import dateParse from "date-fns/parse";
import isBefore from "date-fns/isBefore";

const searchEvents = ({ data }: { data: Record<string, string[]> }) => {
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
      `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&apiKey=${process.env.ODDS_API_KEY}&sport=${sport}`
    )
    .then((r) => {
      const events = r.data
        .filter((d) => {
          const date = new Date(d.commence_time);
          return isBefore(date, endDate) && isBefore(startDate, date);
        })
        .map((e) => ({
          label: `${e.away_team} @ ${e.home_team}`,
          id: e.id,
        }));
      return events;
    });
};

export default searchEvents;
