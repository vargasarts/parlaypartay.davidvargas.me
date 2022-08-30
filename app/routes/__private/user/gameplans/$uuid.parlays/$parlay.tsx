import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import getParlayByUuid from "~/data/getParlayByUuid.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const SingleGameplanSingleParlayPage = () => {
  const data = useLoaderData<Awaited<ReturnType<typeof getParlayByUuid>>>();
  return (
    <div>
      <h1 className="mv-2">Parlay {data.attempt}</h1>
      {Object.entries(data.events)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, data]) => (
          <div
            key={key}
            className={`my-5 text-lg px-2 rounded-sm ${
              data.outcome === null
                ? "bg-transparent"
                : data.outcome === data.prediction
                ? "bg-green-200"
                : "bg-red-200"
            }`}
          >
            {data.prediction
              ? `${data.properties.home} over ${data.properties.away}`
              : `${data.properties.away} over ${data.properties.home}`}
          </div>
        ))}
    </div>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getParlayByUuid);
};

export default SingleGameplanSingleParlayPage;
