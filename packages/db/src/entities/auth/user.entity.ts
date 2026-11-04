import { defineEntity, p } from "@mikro-orm/postgresql";

import { baseProperties } from "../base.entity.ts";

/** RFC 5321 caps a forward path at 256 octets, which leaves 254 for the address. */
const EMAIL_COLUMN_LENGTH = 254;
/** A bcrypt hash is 60 characters; the headroom fits a future argon2id string. */
const PASSWORD_HASH_COLUMN_LENGTH = 100;

const UserSchema = defineEntity({
  name: "User",
  tableName: "users",
  properties: {
    ...baseProperties,
    /** Stored trimmed and lower-cased by `UserService`, so the unique index is case-insensitive in effect. */
    email: p.string().length(EMAIL_COLUMN_LENGTH).unique(),
    passwordHash: p.string().length(PASSWORD_HASH_COLUMN_LENGTH),
    /** `null` until the address is confirmed; an unconfirmed account may still log in (spec A, Q6). */
    emailVerifiedAt: p.datetime().nullable(),
  },
});

export class User extends UserSchema.class {}
UserSchema.setClass(User);
