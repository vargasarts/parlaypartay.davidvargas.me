import React from "react";
import { SignIn } from "@clerk/remix";
import remixAuthedLoader from "@dvargas92495/app/backend/remixAuthedLoader.server";
import getMeta from "@dvargas92495/app/utils/getMeta";

const LoginPage: React.FC = () => (
  <SignIn
    path="/login"
    redirectUrl={"https://parlaypartay.davidvargas.me/user"}
  />
);

export const loader = remixAuthedLoader;
export const meta = getMeta({ title: "Log in" });
export default LoginPage;
