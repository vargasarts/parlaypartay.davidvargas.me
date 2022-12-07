import base from "fuegojs/dist/base";
import schema from "./schema";

base({
  projectName: "parlaypartay.davidvargas.me",
  variables: ["odds_api_key", "clerk_api_key", "database_url"],
  schema,
});
