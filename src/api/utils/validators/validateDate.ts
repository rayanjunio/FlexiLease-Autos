import { ValidationError } from "../../errors/ValidationError";

export function ensureValidDate(date: string | Date): Date {
    let parsedDate: Date;

    if (typeof date === "string") {
      const [day, month, year] = date.split("/").map(Number); 

      if (day && month && year) {
        parsedDate = new Date(year, month-1, day);

      } else {
				const message: string = "Date must be in the format dd/mm/yyyy.";
        throw new ValidationError(400, "Bad Request", message);
      }
    } else {
      parsedDate = date;
    }

    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
			const message: string = "Date must be in the format dd/mm/yyyy.";
      throw new ValidationError(400, "Bad Request", message);
    }
    return parsedDate;
}