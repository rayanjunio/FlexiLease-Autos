import { Repository } from "typeorm";
import { AccessoryService } from "../../../../src/api/services/AccessoryService";
import { CarService } from "../../../../src/api/services/CarService";
import { Accessory } from "../../../../src/database/entities/Accessory";
import { Car } from "../../../../src/database/entities/Car";
import { ValidationError } from "../../../../src/api/errors/ValidationError";
import { RedisClientType } from "redis";

describe("Car Service", () => {
    let mockCarRepository: jest.Mocked<Repository<Car>>;
    let mockAccessoryRepository: jest.Mocked<Repository<Accessory>>;
    let accessoryService: AccessoryService;
    let carService: CarService;
    let redisClientMock: jest.Mocked<RedisClientType>;

    beforeEach(() => {
        mockCarRepository = {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
        } as unknown as jest.Mocked<Repository<Car>>;

        redisClientMock = {
            get: jest.fn(),
            setEx: jest.fn(),
            del: jest.fn(),
        } as unknown as jest.Mocked<RedisClientType>;

        mockAccessoryRepository = {} as unknown as jest.Mocked<Repository<Accessory>>;

        accessoryService = new AccessoryService(mockAccessoryRepository);
        carService = new CarService(mockCarRepository, accessoryService, mockAccessoryRepository, redisClientMock);

        jest.spyOn(accessoryService, "createAccessory").mockImplementation(async (name: string) => {
            return { id: 1, name } as Accessory;
        }); 

        jest.spyOn(accessoryService, "synchronizeAccessories").mockImplementation(async (currentAccessories: Accessory[], newAccessories: Partial<Accessory>[]) => {
            return [
                ...currentAccessories,
                ...newAccessories.map((acc, i) => ({
                    id: currentAccessories.length + i + 1,
                    name: acc.name,
                } as Accessory)),
            ];
        });

        jest.spyOn(accessoryService, "handleAccessoryUpdate").mockImplementation(async (newAccessory: { name: string }, car: Car) => {
            return {
                id: 1,
                name: newAccessory.name,
            } as Accessory;
        });
    });

    describe("createCar", () => {
        it("should return the created car", async() => {
            const accessories = [
                { id: 1, name: "Air-conditioner" },
                { id: 2, name: "Eletric direction" },
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

    describe("getAllCars", () => {
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

    describe("getCarById", () => {
        it("should return a car from redis cache", async () => {
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
    
            redisClientMock.get.mockResolvedValue(JSON.stringify(car));
    
            const result: Car | undefined = await carService.getCarById(car.id);

            expect(result).toEqual(car);
            expect(mockCarRepository.findOne).toHaveBeenCalledTimes(0);
        });

        it("should return a car from database if not cached", async() => {
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

            redisClientMock.get.mockResolvedValue(null);
            mockCarRepository.findOne.mockResolvedValue(car);

            const result: Car | undefined = await carService.getCarById(car.id);

            expect(result).toEqual(car);

            expect(redisClientMock.get).toHaveBeenCalledTimes(1);
            expect(mockCarRepository.findOne).toHaveBeenCalledTimes(1);

            expect(redisClientMock.setEx).toHaveBeenCalledWith(
                `car:${car.id}`,
                300,
                JSON.stringify(car),
            );
        });

        it("should throw an error when car does not exist", async() => {
            redisClientMock.get.mockResolvedValue(null);
            mockCarRepository.findOne.mockResolvedValue(null);

            await expect(carService.getCarById(0))
                .rejects.toThrow(ValidationError);

            expect(redisClientMock.get).toHaveBeenCalledTimes(1);
            expect(redisClientMock.setEx).toHaveBeenCalledTimes(0);
            expect(mockCarRepository.findOne).toHaveBeenCalledTimes(1);
        });  
    });

    describe("updateCar", () => {
        it("should update an existent car", async() => {
            const accessories = [
                { name: "Air-conditioner" },
                { name: "Eletric direction" },
            ];

            const updatedAccessories = [...accessories, { name: "Parking sensor" }];
    
            const car: Car = Object.assign(new Car(), {
                id: 1,
                model: "Toyota Corolla",
                color: "Black", 
                year: 2020,
                valuePerDay: 200,
                numberOfPassengers: 5, 
                accessories: accessories,
            });

            const updatedcar: Car = Object.assign(new Car(), {
                id: 1,
                model: "Hiunday Creta",
                color: "White", 
                year: 2018,
                valuePerDay: 190,
                numberOfPassengers: 6, 
                accessories: updatedAccessories,
            });

            const VALUES_TO_MODIFY: Partial<Car> = { model: "Hiunday Creta", color: "White", year: 2018, valuePerDay: 190, numberOfPassengers: 6 };

            mockCarRepository.findOne.mockResolvedValue(car);
            mockCarRepository.save.mockResolvedValue(updatedcar);

            redisClientMock.del.mockResolvedValue(0);

            const result: Car | undefined = await carService.updateCar(car.id, VALUES_TO_MODIFY);

            expect(result).toEqual(updatedcar);

            expect(result?.accessories).toHaveLength(updatedAccessories.length);

            expect(mockCarRepository.save).toHaveBeenCalledTimes(1);
            expect(redisClientMock.del).toHaveBeenCalledTimes(1);
        }); 

        it("should throw an error when car does not exist", async() => {
            mockCarRepository.findOne.mockResolvedValue(null);

            await expect(carService.updateCar(1, {}))
                .rejects.toThrow(ValidationError);
    
                expect(mockCarRepository.save).toHaveBeenCalledTimes(0);
                expect(redisClientMock.del).toHaveBeenCalledTimes(0);
        });

        it("should throw an error when car year is invalid", async() => {
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

            const INVALID_YEAR: Partial<Car> = { year: 1950 };

            mockCarRepository.findOne.mockResolvedValue(car);

            await expect(carService.updateCar(
                car.id,
                INVALID_YEAR,
            )).rejects.toThrow(ValidationError);

            expect(accessoryService.synchronizeAccessories).toHaveBeenCalledTimes(0);
            expect(mockCarRepository.save).toHaveBeenCalledTimes(0);
            expect(redisClientMock.del).toHaveBeenCalledTimes(0);
        });
    });

    describe("updateAccessory", () => {
        it("should update an accessory from a car", async() => {
            const accessories = [
                { id: 1, name: "Air-conditioner" },
                { id: 2, name: "Eletric direction" },
            ];

            const accessoryToUpdate = { id: 3, name: "Parking sensor" };

            const car: Car = Object.assign(new Car(), {
                id: 1,
                model: "Toyota Corolla",
                color: "Black", 
                year: 2020,
                valuePerDay: 200,
                numberOfPassengers: 5, 
                accessories: accessories,
            });

            const updatedCar: Car = Object.assign(new Car(), {
                id: car.id,
                model: car.model,
                color: car.color,
                year: car.year,
                valuePerDay: car.valuePerDay,
                numberOfPassengers: car.numberOfPassengers,
                accessories: [...car.accessories, accessoryToUpdate],
            });

            mockCarRepository.findOne.mockResolvedValue(car);
            mockCarRepository.save.mockResolvedValue(updatedCar);

            redisClientMock.del.mockResolvedValue(0);

            const result = await carService.updateAccessory(car.id, accessoryToUpdate);

            expect(result.id).toEqual(updatedCar.id);
            expect(result.model).toEqual(updatedCar.model);
            expect(result.color).toEqual(updatedCar.color);
            expect(result.year).toEqual(updatedCar.year);
            expect(result.valuePerDay).toEqual(updatedCar.valuePerDay);
            expect(result.numberOfPassengers).toEqual(updatedCar.numberOfPassengers);
            
            expect(result.accessories).toEqual(updatedCar.accessories.map((accessory) => ({
                name: accessory.name,
            })));

            expect(mockCarRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockCarRepository.save).toHaveBeenCalledTimes(1);

            expect(accessoryService.handleAccessoryUpdate).toHaveBeenCalledTimes(1);

            expect(redisClientMock.del).toHaveBeenCalledTimes(1);
        });

        it("should throw an error when car does not exist", async() => {
            mockCarRepository.findOne.mockResolvedValue(null);

            await expect(carService.updateAccessory(1, { name: "" })
            ).rejects.toThrow(ValidationError);

            expect(accessoryService.handleAccessoryUpdate).toHaveBeenCalledTimes(0);

            expect(mockCarRepository.save).toHaveBeenCalledTimes(0);

            expect(redisClientMock.del).toHaveBeenCalledTimes(0);
        });
    });
});
