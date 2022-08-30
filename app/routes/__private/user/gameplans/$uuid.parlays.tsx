import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import Table from "@dvargas92495/app/components/Table";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import setParlayResult from "~/data/setParlayResult.server";
import { useNavigate, Outlet, Form, useLoaderData } from "@remix-run/react";
import getGameplanParlaysByUuid from "~/data/getGameplanParlaysByUuid.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const SingleGameplanPage = () => {
  const data =
    useLoaderData<Awaited<ReturnType<typeof getGameplanParlaysByUuid>>>();
  const nav = useNavigate();
  return (
    <>
      <h1 className="font-bold text-3xl mb-8">Parlays</h1>
      <div className="w-full flex gap-16">
        <div className="max-w-4xl">
          <Table onRowClick={(row) => nav(row.uuid as string)} />
        </div>
        <Form method="put" className="flex-shrink-0">
          <h1 className={"mb-2"}>Event Results</h1>
          {Object.keys(data.events).sort((a,b) => a.localeCompare(b)).map((k) => (
            <div key={k} className={"mb-2 cursor-pointer"}>
              <button
                name={k}
                value={"false"}
                className={
                  data.events[k].outcome === false
                    ? "bg-sky-500 border-none p-2 rounded-sm w-24"
                    : "border-sky-500 border bg-none p-2 rounded-sm w-24"
                }
              >
                {data.events[k].properties.away}
              </button>
              {" @ "}
              <button
                name={k}
                value={"true"}
                className={
                  data.events[k].outcome === true
                    ? "bg-sky-500 border-none p-2 rounded-sm w-24"
                    : "border-sky-500 border bg-none p-2 rounded-sm w-24"
                }
              >
                {data.events[k].properties.home}
              </button>
              <button
                name={k}
                value={"reset"}
                className={"border-sky-500 border bg-none p-2 rounded-sm ml-8"}
              >
                reset
              </button>
            </div>
          ))}
        </Form>
        <Outlet />
      </div>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getGameplanParlaysByUuid);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, {
    PUT: setParlayResult,
  });
};

export default SingleGameplanPage;
