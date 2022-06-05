import getMeta from "@dvargas92495/app/utils/getMeta";
import { SignUp } from "@clerk/remix";
import remixAuthedLoader from "@dvargas92495/app/backend/remixAuthedLoader.server";

export const loader = remixAuthedLoader;
export const meta = getMeta({ title: "Sign up" });
const SignUpPage = () => (
  <SignUp redirectUrl={"https://parlaypartay.davidvargas.me/user"} />
);
export default SignUpPage;
