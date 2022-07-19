import React from "react";
import Landing, {
  Showcase,
  Splash,
} from "@dvargas92495/app/components/Landing";
import subscribeToConvertkitAction from "@dvargas92495/app/backend/subscribeToConvertkitAction.server";

const Home: React.FC = () => (
  <Landing>
    <Splash
      title={"Turn your sports knowledge into profitable gambling gameplans"}
      subtitle={
        "With Parlay Partay, you can create automated gameplans so you know which teams to pick on game day."
      }
      isWaitlist
    />
    <Showcase
      header="We support gambling events from the following sports."
      showCards={[
        {
          title: "NFL",
          description: "",
        },
        {
          title: "MLB",
          description: "",
        },
        {
          title: "NBA",
          description: "",
        },
      ]}
    />
  </Landing>
);

export const action = subscribeToConvertkitAction;

export const handle = Landing.handle;

export default Home;
