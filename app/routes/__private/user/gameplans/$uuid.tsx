import NumberInput from "@dvargas92495/app/components/NumberInput";
import Select from "@dvargas92495/app/components/Select";
import Button from "@dvargas92495/app/components/Button";
import {
  Form,
  useLoaderData,
  Link,
  useMatches,
  useSubmit,
} from "@remix-run/react";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import remixAppAction from "@dvargas92495/app/backend/remixAppAction.server";
import remixAppLoader from "@dvargas92495/app/backend/remixAppLoader.server";
import searchEvents from "~/data/searchEvents.server";
export { default as CatchBoundary } from "@dvargas92495/app/components/DefaultCatchBoundary";
export { default as ErrorBoundary } from "@dvargas92495/app/components/DefaultErrorBoundary";
import BaseInput from "@dvargas92495/app/components/BaseInput";
import dateFnsFormat from "date-fns/format";
import addDays from "date-fns/addDays";
import TextInput from "@dvargas92495/app/components/TextInput";
import Switch from "@dvargas92495/app/components/Switch";
import createGameplanParlays from "~/data/createGameplanParlays.server";
import deleteEvent from "~/data/deleteEvent.server";
import getGameplanByUuid from "~/data/getGameplanByUuid.server";
import { useState, useRef } from "react";

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
const defaultEnd = addDays(now, 1);

type GameplanData = Awaited<ReturnType<typeof getGameplanByUuid>>;
const EditGameplanPage = () => {
  const data = useLoaderData<GameplanData>();
  const [isCustom, setIsCustom] = useState(true);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const matches = useMatches();
  const dragRef = useRef(0);
  const eventContainerRef = useRef<HTMLDivElement>(null);
  const reorderSubmit = useSubmit();
  return (
    <>
      <div className="flex items-center gap-4 w-full">
        <Form className="flex items-center gap-4 flex-grow" method="put">
          {isManualSearch ? (
            <>
              <TextInput
                name={"away"}
                label={"Away Team"}
                className={"flex-1"}
              />
              <TextInput
                name={"home"}
                label={"Home Team"}
                className={"flex-1"}
              />
              <BaseInput
                label={"Event Date"}
                name={"date"}
                type={"datetime-local"}
                className={"flex-1"}
                defaultValue={dateFnsFormat(now, "yyyy-MM-dd")}
              />
              <Button name={"method"} value={"create"} className={"w-40"}>
                Add Game
              </Button>
            </>
          ) : (
            <>
              <Select
                options={SPORTS}
                label={"Sport"}
                name={"sport"}
                className={"flex-1"}
              />
              <BaseInput
                label={"Start"}
                name={"start"}
                type={"date"}
                defaultValue={dateFnsFormat(now, "yyyy-MM-dd")}
                className={"flex-1"}
              />
              <BaseInput
                label={"End"}
                name={"end"}
                type={"date"}
                defaultValue={dateFnsFormat(defaultEnd, "yyyy-MM-dd")}
                className={"flex-1"}
              />
              <Button name={"method"} value={"search"} className={"w-40"}>
                Search Games
              </Button>
            </>
          )}
        </Form>
        <Switch
          onChange={setIsManualSearch}
          label={"Manual Entry"}
          labelClassname={"w-28"}
        />
      </div>
      <div className="flex-grow flex flex-col">
        <div className="flex-grow overflow-y-auto" ref={eventContainerRef}>
          {(data.events || []).map((evt, index) => (
            <div className={"flex items-center py-2"} key={evt.uuid}>
              <span
                className="flex-grow cursor-grab"
                draggable
                onDragStart={(e) => {
                  const rect = (
                    e.target as HTMLSpanElement
                  ).getBoundingClientRect();
                  dragRef.current = e.clientY - rect.top;
                }}
                onDragEnd={(e) => {
                  const span = e.target as HTMLSpanElement;
                  const newTop = e.clientY - dragRef.current;
                  const children = Array.from(
                    eventContainerRef.current?.children || []
                  );
                  const oldIndex = index.toString();
                  const newIndex = children
                    .filter(
                      (c) =>
                        c.getBoundingClientRect().top < newTop &&
                        !c.contains(span)
                    )
                    .length.toString();
                  reorderSubmit(
                    { newIndex, oldIndex, method: "reorder" },
                    { method: "put" }
                  );
                }}
              >
                {evt.away} {"@"} {evt.home}{" "}
                <span className="italic text-xs opacity-75 ml-2">
                  (
                  {dateFnsFormat(
                    evt.date ? new Date(evt.date) : new Date(),
                    "MM/dd hh:mm"
                  )}
                  )
                </span>
              </span>
              <span className={"flex gap-2 items-center"}>
                {isCustom && (
                  <NumberInput
                    name={`custom-${evt.uuid}`}
                    max={1}
                    min={0}
                    step={0.01}
                    placeholder={"0.5"}
                    className={"mb-0"}
                    onChange={(e) =>
                      setCustomValues({
                        ...customValues,
                        [`custom-${evt.uuid}`]: e.target.value,
                      })
                    }
                    defaultValue={data.customValues?.[evt.uuid]}
                  />
                )}
                <Form method={"delete"}>
                  <button
                    className="py-2 px-4 bg-red-700 text-white cursor-pointer rounded-md text-sm"
                    name={"uuid"}
                    value={evt.uuid}
                  >
                    X
                  </button>
                </Form>
              </span>
            </div>
          ))}
        </div>
        <Form method={"post"} className="flex gap-8 flex-col">
          {Object.entries(customValues).map((cv) => (
            <input type={"hidden"} name={cv[0]} value={cv[1]} key={cv[0]} />
          ))}
          <div className="flex gap-8 w-full items-center">
            <Select
              label="Algorithm"
              name="algorithm"
              options={data.algorithms}
              defaultValue={data.algorithmUuid || data.algorithms[0].id}
              onChange={(e) => setIsCustom(e === "custom")}
            />
            <NumberInput
              label="Count"
              name="count"
              placeholder="0"
              max={Math.pow(2, (data.events || []).length)}
              min={1}
              defaultValue={1}
            />
            <NumberInput
              label="Maximum Upsets"
              name="max-upsets"
              placeholder="0"
              max={data.events.length}
              min={0}
              defaultValue={data.events.length}
            />
            <NumberInput
              label="Minimum Upsets"
              name="min-upsets"
              placeholder="0"
              max={data.events.length}
              min={0}
              defaultValue={0}
            />
          </div>
          <div className="flex gap-8 w-full items-center">
            <Button>Generate</Button>
            {data.hasParlays && (
              <Link
                to={`${matches[4].pathname}/parlays`}
                className={"bg-green-200 rounded-full py-2 px-3 cursor-pointer"}
              >
                View Current Parlays
              </Link>
            )}
          </div>
        </Form>
      </div>
    </>
  );
};

export const loader: LoaderFunction = (args) => {
  return remixAppLoader(args, getGameplanByUuid);
};

export const action: ActionFunction = (args) => {
  return remixAppAction(args, {
    POST: (args) =>
      createGameplanParlays(args).then(() =>
        redirect(`/user/gameplans/${args.params["uuid"]}/parlays`)
      ),
    PUT: searchEvents,
    DELETE: deleteEvent,
  });
};

const Title = (data: GameplanData) => {
  return <>{data?.label}</>;
};

export const handle = {
  Title,
};

export default EditGameplanPage;
