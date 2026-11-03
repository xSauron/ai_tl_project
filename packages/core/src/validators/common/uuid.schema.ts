import { z } from "zod";

export const INVALID_UUID_MESSAGE = "Must be a valid UUID";

/** An RFC 9562 UUID string, the format of every entity id. */
export const uuidSchema = z.uuid({ error: INVALID_UUID_MESSAGE });
