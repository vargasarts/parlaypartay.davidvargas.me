import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import Table from "@dvargas92495/app/components/Table";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import setParlayResult from "~/data/setParlayResult.server";
import exportParlaysToCsv from "~/data/exportParlaysToCsv.server";
import {
  useNavigate,
  Outlet,
  Form,
  useLoaderData,
  Link,
  useMatches,
  useFetcher,
} from "@remix-run/react";
import { useEffect } from "react";
import getGameplanParlaysByUuid from "~/data/getGameplanParlaysByUuid.server";
import Button from "@dvargas92495/app/components/Button";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import { saveAs } from "file-saver";

type GameplanData = Awaited<ReturnType<typeof getGameplanParlaysByUuid>>;

const Title = (data: GameplanData) => {
  return <>{data.title}</>;
};

const SingleGameplanPage = () => {
  const data = useLoaderData<GameplanData>();
  const nav = useNavigate();
  const matches = useMatches();
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data) {
      const { title, parlays } = fetcher.data as Awaited<
        ReturnType<typeof exportParlaysToCsv>
      >;

      saveAs(new Blob([parlays], { type: "text/csv" }), `${title}.csv`);
    }
  }, [fetcher.data]);
  return (
    <>
      <h1 className="font-bold text-3xl mb-8">Parlays</h1>
      <p className="mb-2">{data.data.filter((d) => !d.wrong).length} Left</p>
      <div className="w-full flex gap-16">
        <div className="max-w-4xl flex flex-col">
          <Table
            onRowClick={(row) => nav(row.uuid as string)}
            className={"flex-grow"}
          />
          <div className="flex items-center gap-4">
            <Link to={matches[4].pathname.replace(/\/parlays$/, "")}>Edit</Link>
            <Button onClick={() => fetcher.submit({}, { method: "post" })}>
              Export
            </Button>
          </div>
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
    POST: exportParlaysToCsv,
    PUT: setParlayResult,
  });
};

export const handle = {
  Title,
};

export default SingleGameplanPage;
