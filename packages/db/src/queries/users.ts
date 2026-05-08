import { db } from "..";
import { user } from "../schema";
import { config } from "@musubi/config";
import { ForbiddenError } from "@musubi/types";






// DEV ONLY

export async function resetUsers() {
  if (config.api.environment !== "dev") {
    throw new ForbiddenError("This action is not possible in your environment...");
  } else {
    const [result] = await db.delete(user).returning();
    return result;
  }
}
