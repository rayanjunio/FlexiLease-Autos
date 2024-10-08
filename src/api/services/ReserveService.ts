import { Repository } from "typeorm";
import { Reserve } from "../../database/entities/Reserve";
import { getConnection } from "../../database/connection";
import { Car } from "../../database/entities/Car";
import { ValidationError } from "../errors/ValidationError";
import { User } from "../../database/entities/User";

interface ReserveResponse {
  id: number;
  startDate: string | Date;
  endDate: string | Date;
  finalValue: number;
  carId: number | Car;
  userId: number | User;
}

interface ReserveUpdateRequest {
  startDate: string | Date;
  endDate: string | Date;
  carId: number;
}

export class ReserveService {
  private reserveRepository!: Repository<Reserve>;
  private carRepository!: Repository<Car>;
  private userRepository!: Repository<User>;

  constructor() {
    this.initializeRepository();
  }

  private async initializeRepository() {
    const connect = await getConnection();
    this.reserveRepository = connect.getRepository(Reserve);
    this.carRepository = connect.getRepository(Car);
    this.userRepository = connect.getRepository(User);
  }

  async createReserve(
    startDate: string | Date,
    endDate: string | Date,
    carId: number,
    userId: number,
  ): Promise<Reserve> {
    const car = await this.carRepository.findOne({ where: { id: carId } });

    if (!car) {
      const message = "Typed car id does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || this.calculateAge(user.birth) < 18) {
      const message = "User must be over 18 years old to make a reservation.";
      throw new ValidationError(400, "Bad Request", message);
    }

    startDate = this.ensureValidDate(startDate);
    endDate = this.ensureValidDate(endDate);

    if (endDate.getTime() <= startDate.getTime()) {
      const message = "End date must be after start date.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if (daysDifference < 1) {
      const message = "A reserve needs at least one day.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const carReservations = await this.reserveRepository.find({
      where: {
        carId: { id: carId },
      },
    });

    const isCarReserved = carReservations.some((reservation) => {
      return (
        (startDate >= reservation.startDate &&
          startDate <= reservation.endDate) ||
        (endDate >= reservation.startDate && endDate <= reservation.endDate) ||
        (startDate < reservation.startDate && endDate > reservation.endDate)
      );
    });

    if (isCarReserved) {
      const message = "This car is already reserved for the selected dates.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const userReservations = await this.reserveRepository.find({
      where: {
        userId: { id: userId },
      },
    });

    const isUserReserved = userReservations.some((reservation) => {
      return (
        (startDate >= reservation.startDate &&
          startDate <= reservation.endDate) ||
        (endDate >= reservation.startDate && endDate <= reservation.endDate) ||
        (startDate < reservation.startDate && endDate > reservation.endDate)
      );
    });

    if (isUserReserved) {
      const message =
        "User cannot make another reservation for the same period.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const carValuePerDay = car.valuePerDay;
    const finalValue = carValuePerDay * daysDifference + carValuePerDay;

    const newReserve = this.reserveRepository.create({
      startDate,
      endDate,
      finalValue: finalValue,
      carId: { id: carId },
      userId: { id: userId },
    });

    return await this.reserveRepository.save(newReserve);
  }

  public async getAllReserves(
    userId: number,
    parameters: Partial<Reserve>,
    limit: number,
    offset: number,
  ): Promise<{ reserves: ReserveResponse[]; total: number }> {
    const query = this.reserveRepository
      .createQueryBuilder("reserve")
      .leftJoinAndSelect("reserve.carId", "car")
      .where("reserve.userId = :userId", { userId });

    for (const parameter of Object.keys(
      parameters,
    ) as (keyof Partial<Reserve>)[]) {
      if (parameters[parameter] !== undefined) {
        query.andWhere(`reserve.${parameter} = :${parameter}`, {
          [parameter]: parameters[parameter],
        });
      }
    }

    const total = await query.getCount();

    const reserves = await query.skip(offset).take(limit).getMany();

    return {
      reserves: reserves.map((reserve) => ({
        id: reserve.id,
        startDate: this.formatDate(reserve.startDate),
        endDate: this.formatDate(reserve.endDate),
        finalValue: reserve.finalValue,
        carId: reserve.carId.id,
        userId,
      })),
      total,
    };
  }

  public async getReserveById(
    id: number,
    userId: number,
  ): Promise<ReserveResponse> {
    const reserve = await this.reserveRepository.findOne({
      where: { id, userId },
      relations: ["userId", "carId"],
    });

    if (!reserve) {
      const message = "This reserve does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    const formattedReserve = {
      id: reserve.id,
      startDate: this.formatDate(reserve.startDate),
      endDate: this.formatDate(reserve.endDate),
      finalValue: reserve.finalValue,
      userId: reserve.userId.id,
      carId: reserve.carId.id,
    };

    return formattedReserve;
  }

  public async updateReserve(
    id: number,
    userId: number,
    reserveData: Partial<ReserveUpdateRequest>,
  ): Promise<Reserve> {
    const reserve = await this.reserveRepository.findOne({
      where: { id, userId },
      relations: ["userId", "carId"],
    });

    if (!reserve) {
      throw new ValidationError(
        404,
        "Not Found",
        "This reserve does not exist",
      );
    }

    if (reserve.userId.id !== userId) {
      throw new ValidationError(
        403,
        "Forbidden",
        "Unauthorized: You can only modify your own reservations",
      );
    }

    let carIdToAssign: number = reserve.carId.id;

    if (reserveData.carId !== undefined) {
      carIdToAssign = reserveData.carId;
      const car = await this.carRepository.findOne({
        where: { id: carIdToAssign },
      });
      if (!car) {
        throw new ValidationError(404, "Not Found", "This car does not exist");
      }
    }

    const startDate = this.ensureValidDate(
      reserveData.startDate || reserve.startDate,
    );
    const endDate = this.ensureValidDate(
      reserveData.endDate || reserve.endDate,
    );

    if (endDate.getTime() <= startDate.getTime()) {
      throw new ValidationError(
        400,
        "Bad Request",
        "End date must be after start date.",
      );
    }

    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24) + 1;

    if (daysDifference <= 0) {
      throw new ValidationError(
        400,
        "Bad Request",
        "A reserve needs at least one day.",
      );
    }

    const carValuePerDay = reserve.carId.valuePerDay;
    const finalValue = carValuePerDay * daysDifference;

    reserve.finalValue = finalValue;
    reserve.startDate = startDate;
    reserve.endDate = endDate;
    reserve.carId.id = carIdToAssign;

    await this.reserveRepository.save(reserve);

    const formattedReserve = this.reserveRepository.create({
      id: reserve.id,
      startDate: this.formatDate(reserve.startDate),
      endDate: this.formatDate(reserve.endDate),
      finalValue: reserve.finalValue,
      carId: { id: reserve.carId.id },
      userId: { id: reserve.userId.id },
    });

    return formattedReserve;
  }

  public async deleteReserve(id: number, userId: number) {
    const reserve = await this.reserveRepository.findOne({
      where: { id, userId },
    });

    if (!reserve) {
      const message =
        "This reserve does not exist or does not belong to the user.";
      throw new ValidationError(404, "Not Found", message);
    }

    await this.reserveRepository.delete(id);
  }

  private ensureValidDate(date: string | Date): Date {
    let parsedDate: Date;

    if (typeof date === "string") {
      const dateParts = date.split("/");
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        parsedDate = new Date(year, month, day);
      } else {
        throw new ValidationError(
          400,
          "Bad Request",
          "Date must be in the format dd/mm/yyyy.",
        );
      }
    } else {
      parsedDate = date;
    }

    if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
      throw new ValidationError(
        400,
        "Bad Request",
        "Date must be a valid Date object.",
      );
    }
    return parsedDate;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
