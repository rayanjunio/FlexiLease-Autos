import { Repository } from "typeorm";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import bcrypt from "bcrypt";
import { User } from "../../database/entities/User";
import { ValidationError } from "../errors/ValidationError";
import { consumeApi } from "../utils/apiConsumer";
import { Reserve } from "../../database/entities/Reserve";

interface UserResponse {
  id: number;
  name: string;
  cpf: string;
  birth: string | Date;
  email: string;
  qualified: boolean;
  cep: string;
  neighborhood: string;
  street: string;
  complement: string;
  city: string;
  uf: string;
}

export class UserService {
  constructor(private userRepository: Repository<User>,
    private reserveRepository: Repository<Reserve>,
  ) {}

  async createUser(
    name: string,
    cpf: string,
    birth: string | Date,
    cep: string,
    email: string,
    password: string,
  ): Promise<UserResponse> {
    const now = new Date();

    birth = this.ensureValidDate(birth);

    let age = now.getFullYear() - birth.getFullYear();
    const monthDifference = now.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && now.getDate() < birth.getDate())
    ) {
      age--;
    }

    const qualified = age >= 18;

    const cpfValid = cpfValidator.isValid(cpf);
    if (!cpfValid) {
      const message = "Typed CPF is invalid.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const cpfRegistered = await this.userRepository.findOne({ where: { cpf } });
    if (cpfRegistered) {
      const message = "Typed CPF already is registered.";
      throw new ValidationError(400, "Bad Request", message);
    }

    const regexEmail = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i);
    if (!regexEmail.test(email)) {
      const message = "Typed email is not valid";
      throw new ValidationError(400, "Bad Request", message);
    }

    const emailRegistered = await this.userRepository.findOne({
      where: { email },
    });
    if (emailRegistered) {
      const message = "Typed email already is registered";
      throw new ValidationError(400, "Bad Request", message);
    }

    if (password.length < 6) {
      const message = "Password must have at least 6 characters";
      throw new ValidationError(400, "Bad Request", message);
    }

    const address = await consumeApi(cep);
    const { bairro, logradouro, complemento, localidade, uf } = address;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newUser = this.userRepository.create({
      name,
      cpf,
      birth,
      cep,
      email,
      password: hash,
      qualified,
      neighborhood: bairro,
      street: logradouro,
      complement: complemento,
      city: localidade,
      uf,
    });

    await this.userRepository.save(newUser);

    const formattedUser = {
      id: newUser.id,
      name,
      cpf,
      birth: this.formatDate(newUser.birth),
      cep,
      email,
      qualified,
      neighborhood: bairro,
      street: logradouro,
      complement: complemento,
      city: localidade,
      uf,
    };

    return formattedUser;
  }

  public async getUserById(
    id: number,
    authenticatedUserId: number,
  ): Promise<UserResponse> {
    if (id !== authenticatedUserId) {
      const message =
        "You are not authorized to access this user's information";
      throw new ValidationError(403, "Forbidden", message);
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      const message = "This user does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      birth: this.formatDate(user.birth),
      cep: user.cep,
      email: user.email,
      qualified: user.qualified,
      neighborhood: user.neighborhood,
      street: user.street,
      complement: user.complement,
      city: user.city,
      uf: user.uf,
    };

    return formattedUser;
  }

  public async updateUser(
    id: number,
    userData: Partial<User>,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      const message = "This user does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    if (userData.cpf) {
      if (!cpfValidator.isValid(userData.cpf)) {
        const message = "Typed CPF is invalid.";
        throw new ValidationError(400, "Bad Request", message);
      }

      const cpfExists = await this.userRepository.findOne({
        where: { cpf: userData.cpf },
      });

      if (cpfExists && cpfExists.id !== user.id) {
        const message = "Typed CPF already is registered.";
        throw new ValidationError(400, "Bad Request", message);
      }
      user.cpf = userData.cpf;
    }

    if (userData.email) {
      const regexEmail = new RegExp(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i);

      let matchEmail = regexEmail.test(userData.email);

      if (!matchEmail) {
        const message = "Typed email is not valid";
        throw new ValidationError(400, "Bad Request", message);
      }

      const emailExists = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (emailExists && emailExists.id !== user.id) {
        const message = "Typed email already is registered.";
        throw new ValidationError(400, "Bad Request", message);
      }
      user.email = userData.email;
    }

    if (userData.cep) {
      const address = await consumeApi(userData.cep);
      const { bairro, logradouro, complemento, localidade, uf } = address;

      user.cep = userData.cep;
      user.neighborhood = bairro;
      user.street = logradouro;
      user.complement = complemento;
      user.city = localidade;
      user.uf = uf;
    }

    if (userData.birth) {
      const birthDate = this.ensureValidDate(userData.birth);

      const now = new Date();
      let age = now.getFullYear() - birthDate.getFullYear();
      const monthDifference = now.getMonth() - birthDate.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && now.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      user.qualified = age >= 18;
      user.birth = birthDate;
    }

    if (userData.password) {
      if (userData.password.length < 6) {
        const message = "Password must have at least 6 characters";
        throw new ValidationError(400, "Bad Request", message);
      }
      const password = userData.password;

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      user.password = hash;
    }

    if (userData.name) user.name = userData.name;

    await this.userRepository.save(user);

    const formattedUser = {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      birth: this.formatDate(user.birth),
      cep: user.cep,
      email: user.email,
      qualified: user.qualified,
      neighborhood: user.neighborhood,
      street: user.street,
      complement: user.complement,
      city: user.city,
      uf: user.uf,
    };

    return formattedUser;
  }

  public async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      const message = "This user does not exist";
      throw new ValidationError(404, "Not Found", message);
    }

    await this.reserveRepository.delete({ userId: user });

    await this.userRepository.delete(id);
  }

  private ensureValidDate(birth: string | Date): Date {
    if(typeof birth === "string") {
      const [day, month, year] = birth.split("/").map(Number);
      return new Date(Date.UTC(year, month-1, day+1));
    }

    if (!(birth instanceof Date) || isNaN(birth.getTime())) {
      throw new ValidationError(
        400,
        "Bad Request",
        "Birth date must be a valid Date object.",
      );
    }
    
    return birth;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
