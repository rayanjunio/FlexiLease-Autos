import { createQueryBuilder, Repository } from "typeorm";
import { AccessoryService } from "../../../../src/api/services/AccessoryService";
import { CarService } from "../../../../src/api/services/CarService";
import { Accessory } from "../../../../src/database/entities/Accessory";
import { Car } from "../../../../src/database/entities/Car";
import { ValidationError } from "../../../../src/api/errors/ValidationError";

describe("Car Service", () => {
    let mockCarRepository: jest.Mocked<Repository<Car>>;
    let mockAccessoryRepository: jest.Mocked<Repository<Accessory>>;
    let accessoryService: AccessoryService;
    let carService: CarService;

    beforeEach(() => {
        mockCarRepository = {
            save: jest.fn(),
            findAndCount: jest.fn(),
        } as unknown as jest.Mocked<Repository<Car>>;

        mockAccessoryRepository = {} as unknown as jest.Mocked<Repository<Accessory>>;

        accessoryService = new AccessoryService(mockAccessoryRepository);
        carService = new CarService(mockCarRepository, accessoryService, mockAccessoryRepository);

        jest.spyOn(accessoryService, "createAccessory").mockImplementation(async (name: string) => {
            return { id: 1, name } as Accessory;
        }); 
    });

    it("should return the created car", async() => {
        const accessories = [
            { name: "Air-conditioner" },
            { name: "Eletric direction" },
        ];

        const car: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2020,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        mockCarRepository.save.mockResolvedValue(car);

        const result: Car = await carService.createCar(
            car.model,
            car.color,
            car.year,
            car.valuePerDay,
            car.accessories,
            car.numberOfPassengers,
        );

        expect(result).toEqual(expect.objectContaining({
            id: car.id,
            model: car.model,
            color: car.color,
            year: car.year,
            valuePerDay: car.valuePerDay,
            accessories: expect.arrayContaining([
                expect.objectContaining({ name: car.accessories[0].name }),
                expect.objectContaining({ name: car.accessories[1].name }),
            ]), 
            numberOfPassengers: car.numberOfPassengers,
        }));

        expect(mockCarRepository.save).toHaveBeenCalledTimes(1);
        expect(result.accessories).toHaveLength(2);
        expect(car).toEqual(result);
    });

    it("should throw an error for missing accessories", async() => {
        const car: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2020,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: [],
        });

        await expect(
            carService.createCar(
                car.model,
                car.color,
                car.year,
                car.valuePerDay,
                car.accessories,
                car.numberOfPassengers
            )
        ).rejects.toThrow(ValidationError);
        expect(mockCarRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should throw an error for invalid date", async() => {
        const accessories = [
            { name: "Air-conditioner" },
            { name: "Eletric direction" },
        ];

        const car: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2024,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        await expect(
            carService.createCar(
                car.model,
                car.color,
                car.year,
                car.valuePerDay,
                car.accessories,
                car.numberOfPassengers,
            )
        ).rejects.toThrow(ValidationError);
        expect(mockCarRepository.save).toHaveBeenCalledTimes(0);
    }); 

    it("should throw an error for duplicate accessories", async() => {
        const accessories = [
            { name: "Air-conditioner" },
            { name: "Air-conditioner" },
        ];

        const car: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2020,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        await expect(
            carService.createCar(
                car.model,
                car.color,
                car.year,
                car.valuePerDay,
                car.accessories,
                car.numberOfPassengers,
            )
        ).rejects.toThrow(ValidationError);
        expect(mockCarRepository.save).toHaveBeenCalledTimes(0);
    });

    it("should return all the saved cars without filters", async() => {
        const accessories = [
            { name: "Air-conditioner" },
            { name: "Eletric direction" },
        ];

        const firstCar: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2020,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        const secondCar: Car = Object.assign(new Car(), {
            id: 2,
            model: "Hyundai Creta",
            color: "White", 
            year: 2021,
            valuePerDay: 250,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        const TOTAL_CARS: number = 2;
        const EMPTY_FILTER: Partial<Car> = {};
        const LIMIT: number = 10;
        const OFFSET: number = 0;

         mockCarRepository.findAndCount.mockResolvedValue([
            [firstCar, secondCar], TOTAL_CARS,
        ]);

        const result = await carService.getAllCars(EMPTY_FILTER, LIMIT, OFFSET);

        expect(result).toEqual({
            cars: [firstCar, secondCar],
            total: TOTAL_CARS,
        });

        expect(mockCarRepository.findAndCount).toHaveBeenCalledTimes(1);
        expect(result.cars).toHaveLength(2);

        expect(mockCarRepository.findAndCount).toHaveBeenCalledWith({
            where: EMPTY_FILTER,
            relations: ["accessories"],
            skip: OFFSET,
            take: LIMIT,
        });
    });

    it("should return all the saved cars with filters", async() => {
        const accessories = [
            { name: "Air-conditioner" },
            { name: "Eletric direction" },
        ];

        const firstCar: Car = Object.assign(new Car(), {
            id: 1,
            model: "Toyota Corolla",
            color: "Black", 
            year: 2020,
            valuePerDay: 200,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        const secondCar: Car = Object.assign(new Car(), {
            id: 2,
            model: "Hyundai Creta",
            color: "White", 
            year: 2021,
            valuePerDay: 250,
            numberOfPassengers: 5, 
            accessories: accessories,
        });

        const TOTAL_CARS: number = 1;
        const FILTERS: Partial<Car> = { color: "Black" };
        const LIMIT: number = 10;
        const OFFSET: number = 0;

        mockCarRepository.findAndCount.mockResolvedValue([
            [firstCar], TOTAL_CARS],
        );

        const result = await carService.getAllCars(FILTERS,LIMIT, OFFSET);

        expect(result).toEqual({
            cars: [firstCar],
            total: TOTAL_CARS,
        });

        expect(mockCarRepository.findAndCount).toHaveBeenCalledTimes(1);
        expect(result.cars).toHaveLength(1);

        expect(mockCarRepository.findAndCount).toHaveBeenCalledWith({
            where: FILTERS,
            relations: ["accessories"],
            skip: OFFSET,
            take: LIMIT,
        });
    });
});
