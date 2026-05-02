import { Request, Response } from "express";
import { resetUsers } from '@musubi/db';
import { config } from "@musubi/config";




// DEV ONLY

export async function handlerResetUsers(req: Request, res: Response) {
  if (config.api.environment === "dev") {
    await resetUsers();
    res.sendStatus(205);
  } else {
    res.sendStatus(403);
  }
}
