import Button from "@dvargas92495/app/components/Button";
import Table from "@dvargas92495/app/components/Table";
import { Form, useNavigate } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import searchGameplans from "~/data/searchGameplans.server";
import createGameplan from "~/data/createGameplan.server";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import TextInput from "@dvargas92495/app/components/TextInput";

export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const GameplansPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Table className="flex-grow" onRowClick={(row) => navigate(row.uuid as string)} />
      <Form method={"post"}>
        <TextInput name="label" label={"Label"} />
        <Button>+ New</Button>
      </Form>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, searchGameplans);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, {
    POST: (args) =>
      createGameplan(args).then((uuid) => redirect(`/user/gameplans/${uuid}`)),
  });
};

export default GameplansPage;
