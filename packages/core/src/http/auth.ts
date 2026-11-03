/**
 * The authenticated caller. A service method that touches owned data takes it
 * as its first argument, so a missing actor fails at compile time.
 */
export type Actor = { userId: string };
