import React from "react";
import getMeta from "@dvargas92495/app/utils/getMeta";
import UserDashboard from "@dvargas92495/app/components/UserDashboard";

const TABS = ["strategies", "algorithms", "guilds"];


const UserPage: React.FunctionComponent = () => {
  return <UserDashboard tabs={TABS} title={"Parlay Partay"} />;
};

export const meta = getMeta({
  title: "user",
});

export default UserPage;
