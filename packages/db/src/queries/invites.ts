import { calendarInvites, db, NewCalendarInvite } from "..";


export async function createInvite(invite: NewCalendarInvite) {
  const [result] = await db
    .insert(calendarInvites)
    .values(invite)
    .onConflictDoNothing()
    .returning();

  return result;
}  
