import { Request, Response } from "express";


export function handlerServerStatus(req: Request, res: Response) {
  res.status(200).json({ ok: true });
}

