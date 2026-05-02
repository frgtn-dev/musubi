import { eq } from "drizzle-orm";
import { db } from "..";
import { NewEvent, calendarEvents, calendarMembers, eventUsers, events } from "../schema";


export async function createEvent(event: NewEvent, calendars: string[]) {
  const [result] = await db
    .insert(events)
    .values(event)
    .onConflictDoNothing()
    .returning();
  await db.insert(eventUsers).values({
    userID: result.creatorID,
    eventID: result.id,
  })

  await db.insert(calendarEvents).values(calendars.map(c => (
    {
      calendarID: c,
      eventID: result.id,
    }
  )));

  return result;
}

export async function getEvent(id: string) {
  const [result] = await db
    .select()
    .from(events)
    .where(eq(events.id, id));
  return result;
}

export async function updateEvent(event: NewEvent) {
  const [result] = await db
    .update(events)
    .set(event)
    .where(eq(events.id, event.id!)).returning();
  return result;
}

export async function getUsersEvents(userID: string) {
  const result = await db.query.calendarMembers.findMany({
    where: eq(calendarMembers.userID, userID),
    with: {
      calendars: {
        with: {
          calendarEvents: {
            with: {
              events: true,
            }
          }
        }
      },
    }
  });

  return result;
}

export async function removeEvent(eventID: string) {
  const [result] = await db.delete(events).where(eq(events.id, eventID)).returning();

  return result;
}

