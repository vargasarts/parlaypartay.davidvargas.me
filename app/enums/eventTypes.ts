type EventBase = {
  id: string;
};

export type MoneyLineEvent = {
  type: 1;
  home: string;
  away: string;
} & EventBase;

export type OverUnderEvent = {
  type: 2;
  home: string;
  away: string;
} & EventBase;

const EVENT_TYPES = [
  { id: 1, label: "Money Line" },
  { id: 2, label: "Over Under" },
];

export const idByLabel = Object.fromEntries(
  EVENT_TYPES.map((e) => [e.label, e.id])
);

export default EVENT_TYPES;
