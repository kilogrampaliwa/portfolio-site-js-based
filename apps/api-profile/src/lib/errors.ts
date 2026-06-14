/** Thrown by route handlers; mapped to a JSON error response by the central error handler. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type ErrorBody = {
  error: { code: string; message: string };
};

/** Standard `{ error: { message, code } }` shape used by every error response. */
export function errorBody(code: string, message: string): ErrorBody {
  return { error: { code, message } };
}
