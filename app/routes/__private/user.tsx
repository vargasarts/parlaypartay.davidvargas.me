import React from "react";
import getMeta from "@dvargas92495/app/utils/getMeta";
import UserDashboard from "@dvargas92495/app/components/UserDashboard";
export { default as loader } from "@dvargas92495/app/backend/isAdminLoader.server";

const TABS = ["gameplans", "algorithms", "guilds"];

const UserPage: React.FunctionComponent = () => {
  return <UserDashboard tabs={TABS} title={"Parlay Partay"} />;
};

export const meta = getMeta({
  title: "user",
});

export default UserPage;
