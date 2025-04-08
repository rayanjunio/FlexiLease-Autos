import { ValidationError } from "../errors/ValidationError";

export function verifyUserCompatibility(userId: number, authenticatedUserId: number) {
    if (userId !== authenticatedUserId) {
        throw new ValidationError(
          403,
          "Forbidden",
          "You are not authorized to access this user's information.",
        );
    }
}