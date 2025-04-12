import { Repository } from "typeorm";
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
});
