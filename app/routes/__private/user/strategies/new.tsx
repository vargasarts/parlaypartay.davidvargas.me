import NumberInput from "@dvargas92495/app/components/NumberInput";
import Select from "@dvargas92495/app/components/Select";
import Button from "@dvargas92495/app/components/Button";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import listAlgorithmsByUser from "~/data/listAlgorithmsByUser.server";
import searchEvents from "~/data/searchEvents.server";
import { useEffect, useState } from "react";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import createParlay from "~/data/createStrategy.server";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import dateFnsFormat from "date-fns/format";
import addYears from "date-fns/addYears";

const SPORTS = [
  {
    id: "americanfootball_nfl",
    label: "NFL",
  },
  {
    id: "baseball_mlb",
    label: "MLB",
  },
  {
    id: "basketball_nba",
    label: "NBA",
  },
  {
    id: "icehockey_nhl",
    label: "NHL",
  },
];

const now = new Date();
const defaultEnd = addYears(now, 1);

const NewParlayPage = () => {
  const data =
    useLoaderData<Awaited<ReturnType<typeof listAlgorithmsByUser>>>();
  const fetcher = useFetcher<Awaited<ReturnType<typeof searchEvents>>>();
  const [events, setEvents] = useState<
    Awaited<ReturnType<typeof searchEvents>>
  >([]);
  useEffect(() => {
    if (fetcher.data && events.length === 0)
      setEvents(events.concat(fetcher.data));
  }, [fetcher.data]);
  return (
    <>
      <fetcher.Form className="flex items-center gap-4" method="put">
        <Select
          options={SPORTS}
          label={"Sport"}
          name={"sport"}
          className={"w-24 mb-6"}
        />
        <BaseInput
          label={"Start"}
          name={"start"}
          type={"date"}
          defaultValue={dateFnsFormat(now, "yyyy-MM-dd")}
        />
        <BaseInput
          label={"End"}
          name={"end"}
          type={"date"}
          defaultValue={dateFnsFormat(defaultEnd, "yyyy-MM-dd")}
        />
        <Button>Add Games</Button>
      </fetcher.Form>
      <Form className="flex-grow flex flex-col" method="post">
        <div className="flex-grow overflow-y-auto">
          {events.map((evt) => (
            <div key={evt.id} className={"flex items-center py-2"}>
              <input type={"hidden"} defaultValue={evt.label} name={"events"} />
              <span className="flex-grow">{evt.label}</span>
              <button
                type="button"
                className="p-2 bg-red-700 text-white cursor-pointer"
                onClick={() => setEvents(events.filter((e) => e.id !== evt.id))}
              >
                X
              </button>
            </div>
          ))}
        </div>
        <NumberInput
          label="Count"
          name="count"
          placeholder="0"
          max={Math.pow(2, events.length)}
          min={1}
        />
        <Select label="Algorithm" name="algorithm" options={data} />
        <Button>Generate</Button>
      </Form>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, listAlgorithmsByUser);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, ({ method, data }) => {
    if (method === "POST")
      return createParlay({ data }).then((uuid) =>
        redirect(`/user/strategies/${uuid}`)
      );
    else if (method === "PUT") return searchEvents({ data });
    else throw new Response(`Method ${method} not found`, { status: 404 });
  });
};

export default NewParlayPage;
