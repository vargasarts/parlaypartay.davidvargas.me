import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import Table from "@dvargas92495/app/components/Table";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import setParlayResult from "~/data/setParlayResult.server";
import {
  useNavigate,
  Outlet,
  Form,
  useLoaderData,
  Link,
  useMatches,
} from "@remix-run/react";
import getGameplanParlaysByUuid from "~/data/getGameplanParlaysByUuid.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

type GameplanData = Awaited<ReturnType<typeof getGameplanParlaysByUuid>>;

const Title = (data: GameplanData) => {
  return <>{data.title}</>;
};

const SingleGameplanPage = () => {
  const data = useLoaderData<GameplanData>();
  const nav = useNavigate();
  const matches = useMatches();
  return (
    <>
      <h1 className="font-bold text-3xl mb-8">Parlays</h1>
      <div className="w-full flex gap-16">
        <div className="max-w-4xl flex flex-col">
          <Table
            onRowClick={(row) => nav(row.uuid as string)}
            className={"flex-grow"}
          />
          <Link to={matches[4].pathname.replace(/\/parlays$/, "")}>Edit</Link>
        </div>
        <Form method="put" className="flex-shrink-0">
          <h1 className={"mb-2"}>Event Results</h1>
          {data.events.map((k) => (
            <div key={k.uuid} className={"mb-2 cursor-pointer"}>
              <button
                name={k.uuid}
                value={"false"}
                className={
                  k.outcome === false
                    ? "bg-sky-500 border-none p-2 rounded-sm w-24"
                    : "border-sky-500 border bg-none p-2 rounded-sm w-24"
                }
              >
                {k.properties.away}
              </button>
              {" @ "}
              <button
                name={k.uuid}
                value={"true"}
                className={
                  k.outcome === true
                    ? "bg-sky-500 border-none p-2 rounded-sm w-24"
                    : "border-sky-500 border bg-none p-2 rounded-sm w-24"
                }
              >
                {k.properties.home}
              </button>
              <button
                name={k.uuid}
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

export const handle = {
  Title,
};

export default SingleGameplanPage;
