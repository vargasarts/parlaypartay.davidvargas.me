import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import getParlayByUuid from "~/data/getStrategyParlaysByUuid.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";

const SingleStrategyPage = () => {
  const data = useLoaderData<Awaited<ReturnType<typeof getParlayByUuid>>>();
  return (
    <>
      <h1 className="font-bold text-3xl">Results</h1>
      {data.results.map((result, i) => (
        <div key={i} className={'mb-8'}>
          {result.map((res, j) => (
            <div key={j}>
              {data.events[j]} - {`${res}`}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getParlayByUuid);
};

export default SingleStrategyPage;
