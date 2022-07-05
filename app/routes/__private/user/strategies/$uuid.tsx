import NumberInput from "@dvargas92495/app/components/NumberInput";
import Select from "@dvargas92495/app/components/Select";
import Button from "@dvargas92495/app/components/Button";
import { Form, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import searchEvents from "~/data/searchEvents.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import dateFnsFormat from "date-fns/format";
import addYears from "date-fns/addYears";
import TextInput from "@dvargas92495/app/components/TextInput";
import createStrategyParlays from "~/data/createStrategyParlays.server";
import deleteEvent from "~/data/deleteEvent.server";
import getStrategyByUuid from "~/data/getStrategyByUuid.server";

const SPORTS = [
  {
    id: "a",
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

const EditStrategyPage = () => {
  const data = useLoaderData<Awaited<ReturnType<typeof getStrategyByUuid>>>();
  return (
    <>
      <Form className="flex items-center gap-4" method="put">
        <TextInput name={"away"} label={"Away Team"} />
        <TextInput name={"home"} label={"Home Team"} />
        <Button name={"method"} value={"create"}>
          Add Game
        </Button>
      </Form>
      <Form className="flex items-center gap-4" method="put">
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
        <Button name={"method"} value={"search"}>
          Search Games
        </Button>
      </Form>
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto">
          {(data.events || []).map((evt) => (
            <Form
              key={evt.uuid}
              className={"flex items-center py-2"}
              method={"delete"}
            >
              <span className="flex-grow">
                {evt["away"]} {"@"} {evt.home}
              </span>
              <button className="py-2 px-4 bg-red-700 text-white cursor-pointer rounded-md text-sm" name={'uuid'} value={evt.uuid}>
                X
              </button>
            </Form>
          ))}
        </div>
        <Form method="post">
          <div className="flex space-between">
            <TextInput
              label="Label"
              name="label"
              placeholder="Enter label..."
            />
            <NumberInput
              label="Count"
              name="count"
              placeholder="0"
              max={Math.pow(2, (data.events || []).length)}
              min={1}
            />
            <Select
              label="Algorithm"
              name="algorithm"
              options={data.algorithms?.data}
            />
          </div>
          <Button>Generate</Button>
        </Form>
      </div>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getStrategyByUuid);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, {
    POST: ({ data, userId }) =>
      createStrategyParlays({ data, userId }).then((uuid) =>
        redirect(`/user/strategies/${uuid}/parlays`)
      ),
    PUT: searchEvents,
    DELETE: deleteEvent,
  });
};

export default EditStrategyPage;
