import { Request, Response } from "express";
import { addCalendarMember, createCalendar, getCalendar, getCalendarEvents, getCalendarIDFromToken, getCalendarMembers, getUsersCalendars, NewCalendar, removeCalendar, removeClaendarMember, updateCalendar } from '@musubi/db';
import { BadRequestError, NotFoundError } from "@musubi/types";
import * as z from "zod";
import { notifyCalendarMembers } from "./stream";


const Calendar = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  members: z.array(z.string()),
  invite: z.string(),
});

export type Calendar = z.infer<typeof Calendar>;

export async function handlerCreateCalendar(req: Request, res: Response) {
  let calendar: Calendar;
  try {
    calendar = z.parse(Calendar, req.body);
  } catch (err) {
    throw new BadRequestError("Request is missing valid calendar data...");
  }
  const newCalendar: NewCalendar = {
    name: calendar.name,
    color: calendar.color,
    creatorID: req.user!.id,
  }
  const result = await createCalendar(newCalendar);
  res.status(201).json({ ...result, members: [req.user!.id], invites: "wip" });
}

export async function handlerRemoveCalendar(req: Request, res: Response) {
  let calendar: Calendar;
  try {
    calendar = z.parse(Calendar, req.body);
  } catch (err) {
    throw new BadRequestError("Request is missing valid calendar data...");
  }
  const members = await getCalendarMembers(calendar.id);
  const removedCalendar = await removeCalendar(calendar.id);

  if (removedCalendar) {

    const result = { ...removedCalendar, members: [], invites: "wip" };

    const memberIDSeen = new Set<string>();


    for (const member of members) {
      if (!memberIDSeen.has(member.userID)) {
        memberIDSeen.add(member.userID);
      }
    }

    notifyCalendarMembers([...memberIDSeen], "calendar_removed", result);

    return res.status(200).json(result);
  }
  throw new NotFoundError("Calendar not found...")

}

export async function handlerUpdateCalendar(req: Request, res: Response) {
  let calendar: Calendar;
  try {
    calendar = Calendar.parse(req.body);
  } catch (err) {
    throw new BadRequestError("Request missing valid calendar data...");
  }

  const updatedCalendar = await updateCalendar({ ...calendar, creatorID: req.user!.id });

  if (updatedCalendar) {

    const result = { ...updatedCalendar, members: calendar.members, invite: calendar.invite };

    const memberIDSeen = new Set<string>();

    const members = await getCalendarMembers(calendar.id);

    for (const member of members) {
      if (!memberIDSeen.has(member.userID)) {
        memberIDSeen.add(member.userID);
      }
    }

    notifyCalendarMembers([...memberIDSeen], "calendar_updated", result);


    return res.status(200).json({ ...result, members: calendar.members, invite: calendar.invite });
  }
  throw new NotFoundError("Calendar not found...");
}

export async function handlerGetCalendars(req: Request, res: Response) {
  const calendars = await getUsersCalendars(req.user!.id!);
  const result: Calendar[] = [];

  for (const calendar of calendars) {
    const members: string[] = [];
    const users = await getCalendarMembers(calendar.calendarID);
    for (const user of users) {
      members.push(user.user.id);
    }
    result.push({ ...calendar.calendars, members: members, invite: "wip" })
  }

  res.status(200).json(result);
}

export async function handlerGetCalendarFromToken(req: Request, res: Response) {
  const calendarID = await getCalendarIDFromToken(req.params.token as string);
  const result = await getCalendar(calendarID);
  const members = await getCalendarMembers(calendarID);
  const events = await getCalendarEvents(calendarID);

  res.status(200).json({
    ...result,
    members: members.map(u => ({
      name: u.user.name,
      email: u.user.email,
      id: u.user.id,
    })),
    events: events.map(e => (e.events)),
  });
}

export async function handlerGetCalendar(req: Request, res: Response) {
  const result = await getCalendar(req.params.id as string);

  const members = await getCalendarMembers(req.params.id as string);

  res.status(200).json({
    ...result, members: members.map(u => ({
      name: u.user.name,
      email: u.user.email,
      id: u.user.id,
    })),
  });
}

export async function handlerJoinCalendar(req: Request, res: Response) {
  const result = await addCalendarMember(req.user?.id!, req.params.calendarId as string);

  res.status(200).json(result);
}

export async function handlerLeaveCalendar(req: Request, res: Response) {
  await removeClaendarMember(req.user?.id!, req.params.calendarId as string);

  res.sendStatus(200);
}

