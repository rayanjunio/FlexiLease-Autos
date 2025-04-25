import { Repository } from "typeorm";
import { Accessory } from "../../../../src/database/entities/Accessory";
import { AccessoryService } from "../../../../src/api/services/AccessoryService";
import { ValidationError } from "../../../../src/api/errors/ValidationError";
import { Car } from "../../../../src/database/entities/Car";

describe("Accessory Service", () => {
    let mockAccessoryRepository: jest.Mocked<Repository<Accessory>>;
    let accessoryService: AccessoryService;

    beforeEach(() => {
        mockAccessoryRepository = {
            save: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<Accessory>>;

        accessoryService = new AccessoryService(mockAccessoryRepository);
    });

    describe("createAccessory", () => {
        it("should create an accessory successfuly", async () => {
            const accessoryToCreate: string = "Air-conditioner";

            let accessory: Accessory = new Accessory();
            accessory.name = accessoryToCreate;

            mockAccessoryRepository.save.mockResolvedValue(accessory);

            const result = await accessoryService.createAccessory(accessoryToCreate);

            expect(result).toEqual(accessory);

            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(1);
        });

        it("should throw an error for accessory name empty", async() => {
            const EMPTY_NAME: string = "";

            await expect(accessoryService.createAccessory(EMPTY_NAME)).rejects.toThrow(ValidationError);

            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(0);
        });

        it("should throw an error for accessory name with only whitespace", async() => {
            const WHITESPACE: string = " ";

            await expect(accessoryService.createAccessory(WHITESPACE)).rejects.toThrow(ValidationError);

            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(0);
        });
    });

    describe("handleAccessoryUpdate", () => {
        it("should create and return a unique accessory", async() => {
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

            const NEW_ACCESSORY = { name: "turbo mode" };

            let accessoryToReturn: Accessory = new Accessory();

            accessoryToReturn.name = NEW_ACCESSORY.name;
            accessoryToReturn.car = car;

            mockAccessoryRepository.save.mockResolvedValue(accessoryToReturn);

            const result: Accessory | null = await accessoryService.handleAccessoryUpdate(NEW_ACCESSORY, car);

            expect(result).toEqual(accessoryToReturn);

            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(1);
            expect(mockAccessoryRepository.delete).toHaveBeenCalledTimes(0);
        });

        it("should throw an error when new accessory name is empty", async() => {
            const EMPTY_ACCESSORY = { name: " " };

            const car: Car = new Car();

            await expect(accessoryService.handleAccessoryUpdate(EMPTY_ACCESSORY, car)).rejects.toThrow(ValidationError);

            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(0);
            expect(mockAccessoryRepository.delete).toHaveBeenCalledTimes(0);
        });

        it("should return null when the new accessory is already in the car", async() => {
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

            const newAccessory = accessories[0];

            await expect(accessoryService.handleAccessoryUpdate(newAccessory, car)).resolves.toBeNull();

            expect(mockAccessoryRepository.delete).toHaveBeenCalledTimes(1);
            expect(mockAccessoryRepository.save).toHaveBeenCalledTimes(0);
        });
    });

    describe("synchronizeAccessories", () => {
        it("should remove the accessory that is passed twice and return the updated accessories", async() => {
            const accessories: Accessory[] = [
                { id: 1, name: "Air-conditioner" },
            ] as Accessory[];

            const car: Car = Object.assign(new Car(), {
                id: 1,
                model: "Toyota Corolla",
                color: "Black", 
                year: 2020,
                valuePerDay: 200,
                numberOfPassengers: 5, 
                accessories: accessories,
            });

            const newAccessories: Partial<Accessory>[] = [
                { name: "Air-conditioner" },
                { name: "Turbo mode" },
            ];

            jest.spyOn(accessoryService, "deleteAccessory").mockResolvedValue();

            jest.spyOn(accessoryService, "createAccessory").mockImplementation(async(name: string) => {
                return { id: 2, name } as Accessory;
            });

            const result = await accessoryService.synchronizeAccessories(car.accessories, newAccessories);

            expect(result).toEqual([
                { id: 2, name: "Turbo mode" },
            ]);
        });

        it("should throw an error for duplicated accessories", async() => {
            const currentAccessories: Accessory[] = [];

            const newAccessories: Partial<Accessory>[] = [
                { name: "Air-conditioner" },
                { name: "Air-conditioner" },
            ];

            jest.spyOn(accessoryService, "hasDuplicates")
                .mockImplementation((accessories?: Partial<Accessory>[]) => {
                return true;
            });

            await expect(accessoryService.synchronizeAccessories(currentAccessories, newAccessories))
                .rejects.toThrow(ValidationError);

            expect(accessoryService.hasDuplicates).toHaveBeenCalledWith(newAccessories);
        });
    });
});
