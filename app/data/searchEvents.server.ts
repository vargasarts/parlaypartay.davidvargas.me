import fs from "fs";
import axios from "axios";

const searchEvents = ({ data }: { data: Record<string, string[]> }) => {
  const cache = fs.existsSync(`public/data/cache.json`)
    ? JSON.parse(fs.readFileSync(`public/data/cache.json`).toString())
    : {};
  const search = data["search"][0];
  return cache[search]
    ? Promise.resolve(cache[search] as { id: string; label: string }[])
    : axios
        .get<
          {
            away_team: string;
            home_team: string;
            id: string;
            commence_time: string;
          }[]
        >(
          `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&oddsFormat=american&apiKey=${process.env.ODDS_API_KEY}`
        )
        .then((r) => {
          const events = r.data
            .filter(
              (e) =>
                e.commence_time.startsWith("2022-09-11") ||
                e.commence_time.startsWith("2022-09-12") ||
                e.commence_time.startsWith("2022-09-09") ||
                e.commence_time.startsWith("2022-09-13")
            )
            .map((e) => ({
              label: `${e.away_team} @ ${e.home_team}`,
              id: e.id,
            }));
          cache[search] = events;
          fs.writeFileSync(`public/data/cache.json`, JSON.stringify(cache));
          return events;
        });
};

export default searchEvents;
