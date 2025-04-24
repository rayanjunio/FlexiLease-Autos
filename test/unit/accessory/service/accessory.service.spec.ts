import { Repository } from "typeorm";
import { Accessory } from "../../../../src/database/entities/Accessory";
import { AccessoryService } from "../../../../src/api/services/AccessoryService";
import { ValidationError } from "../../../../src/api/errors/ValidationError";

describe("Accessory Service", () => {
    let mockAccessoryRepository: jest.Mocked<Repository<Accessory>>;
    let accessoryService: AccessoryService;

    beforeEach(() => {
        mockAccessoryRepository = {
            save: jest.fn(),
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
});
