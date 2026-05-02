import { Request, Response } from "express";
import { NewEvent, createEvent, getCalendarMembers, getUsersEvents, removeEvent, updateEvent } from '@musubi/db';
import { BadRequestError, NotFoundError } from "@musubi/types";
import * as z from "zod";
import { notifyCalendarMembers } from "./stream";

const Event = z.object({
  id: z.string(),
  title: z.string(),
  color: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  calendars: z.array(z.string()),
});

export type Event = z.infer<typeof Event>;

export async function handlerCreateEvent(req: Request, res: Response) {
  let event: Event;
  try {
    event = Event.parse(req.body);
  } catch (err) {
    throw new BadRequestError("Request is missing valid event data...");
  }
  const newEvent: NewEvent = {
    title: event.title,
    color: event.color,
    start: event.start,
    end: event.end,
    creatorID: req.user!.id,
  }
  const createdEvent = await createEvent(newEvent, event.calendars);

  const result = { ...createdEvent, calendars: event.calendars };

  const memberIDSeen = new Set<string>();

  for (const cal of event.calendars) {
    const members = await getCalendarMembers(cal);

    for (const member of members) {
      if (!memberIDSeen.has(member.userID)) {
        memberIDSeen.add(member.userID);
      }
    }
  }

  notifyCalendarMembers([...memberIDSeen], "event_created", result);

  res.status(201).json(result);
}

export async function handlerUpdateEvent(req: Request, res: Response) {
  let event: Event;
  try {
    event = Event.parse(req.body);
  } catch (err) {
    throw new BadRequestError("Request missing valid event data...");
  }

  const updatedEvent = await updateEvent({ ...event, creatorID: req.user!.id });

  if (updatedEvent) {

    const result = { ...updatedEvent, calendars: event.calendars };

    const memberIDSeen = new Set<string>();

    for (const cal of event.calendars) {
      const members = await getCalendarMembers(cal);

      for (const member of members) {
        if (!memberIDSeen.has(member.userID)) {
          memberIDSeen.add(member.userID);
        }
      }
    }

    notifyCalendarMembers([...memberIDSeen], "event_updated", result);

    return res.status(200).json({ ...result, calendars: event.calendars });
  }
  throw new NotFoundError("Request missing valid event data...");
}

export async function handlerRemoveEvent(req: Request, res: Response) {
  let event: Event;
  try {
    event = Event.parse(req.body);
  } catch (err) {
    throw new BadRequestError("Request missing valid event data...");
  }

  const removedEvent = await removeEvent(event.id);

  if (removedEvent) {

    const result = { ...removedEvent, calendars: event.calendars };

    const memberIDSeen = new Set<string>();

    for (const cal of event.calendars) {
      const members = await getCalendarMembers(cal);

      for (const member of members) {
        if (!memberIDSeen.has(member.userID)) {
          memberIDSeen.add(member.userID);
        }
      }
    }

    notifyCalendarMembers([...memberIDSeen], "event_removed", result);

    return res.status(200).json(result);
  }
  throw new NotFoundError("Event not found...");
}

type TempEvent = {
  title: string,
  id: string,
  color: string,
  start: Date,
  end: Date,
  calendars: string[],
}

export async function handlerGetEvents(req: Request, res: Response) {
  const result = await getUsersEvents(req.user!.id!);
  const seen = new Map<string, TempEvent>();
  for (const calendarMember of result) {
    for (const calendarEvent of calendarMember.calendars.calendarEvents) {
      const event = calendarEvent.events
      if (!seen.has(event.id)) {
        const newEvent = {
          title: event.title,
          id: event.id,
          color: event.color,
          start: event.start,
          end: event.end,
          calendars: [calendarEvent.calendarID],
        }
        seen.set(event.id, newEvent);
      } else {
        const updateEvent = seen.get(event.id);
        updateEvent?.calendars.push(calendarEvent.calendarID);
      }
    }
  }
  const events: Event[] = Array.from(seen.values());
  res.status(200).json({
    events,
  });
}

