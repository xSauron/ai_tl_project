import type { User } from "@plantai/db";

/** What the API and pages see of a user: never `passwordHash`. */
export type UserDto = {
  id: string;
  email: string;
  isEmailVerified: boolean;
};

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    isEmailVerified: user.emailVerifiedAt instanceof Date,
  };
}
