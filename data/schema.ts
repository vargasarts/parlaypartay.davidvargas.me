import { z } from "zod";

const algorithm = z.object({
  uuid: z.string().uuid().describe("primary"),
  label: z.string().max(128).describe("unique"),
  userId: z.string().max(32).describe("unique"),
  custom: z.boolean(),
});

const eventProperty = z.object({
  uuid: z.string().uuid().describe("primary"),
  label: z.string().max(64),
  value: z.string().max(64),
  eventUuid: z.string().uuid().describe("foreign"),
});

const event = z.object({
  uuid: z.string().uuid().describe("primary"),
  type: z.number().max(Math.pow(2, 8)),
  gameplanUuid: z.string().uuid().describe("foreign"),
  outcome: z.boolean().optional(),
  position: z.number(),
});

const gameplan = z.object({
  uuid: z.string().uuid().describe("primary"),
  label: z.string().max(64).describe("unique"),
  userId: z.string().max(32).describe("unique"),
  algorithmUuid: z.string().uuid().optional().describe("foreign"),
});

const parlayResult = z.object({
  uuid: z.string().uuid().describe("primary"),
  eventUuid: z.string().uuid().describe("foreign"),
  parlayUuid: z.string().uuid().describe("foreign"),
  outcome: z.boolean(),
});

const parlay = z.object({
  uuid: z.string().uuid().describe("primary"),
  attempt: z.boolean(),
  gameplanUuid: z.string().uuid().describe("foreign"),
});

const schema = {
  algorithm,
  eventProperty,
  event,
  gameplan,
  parlayResult,
  parlay,
};

export default schema;
