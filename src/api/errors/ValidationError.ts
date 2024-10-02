export class ValidationError extends Error {
  private code: number;
  private status: string;
  public message: string;

  constructor(code: number, status: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.message = message;
  }
}
