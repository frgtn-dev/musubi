import { Request, Response } from "express";
import { createInvite, NewCalendarInvite } from '@musubi/db';
import * as z from "zod";
import { BadRequestError } from "@musubi/types";


const Invite = z.object({
  id: z.string(),
  calendarID: z.uuid(),
  expiresAt: z.coerce.date(),
  maxUses: z.number(),
});

export type Invite = z.infer<typeof Invite>;

export async function handlerCreateCalendarInvite(req: Request, res: Response) {
  let invite: Invite;
  try {
    invite = Invite.parse(req.body);
  } catch (err) {
    throw new BadRequestError("Request is missing valid invite data...");
  }
  const newCalendarInvite: NewCalendarInvite = {
    expiresAt: new Date(invite.expiresAt),
    maxUses: invite.maxUses,
    calendarID: invite.calendarID,
  }
  const result = await createInvite(newCalendarInvite);

  res.status(201).json(result);
}
