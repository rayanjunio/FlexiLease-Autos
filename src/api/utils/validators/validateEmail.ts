export function isEmailValid(email: string): boolean {
    const emailRegex: RegExp = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i);
    return emailRegex.test(email);
}