import axios from "axios";
import { ValidationError } from "../errors/ValidationError";

export async function consumeApi(cep: string) {
  if (!/^\d{8}$/.test(cep)) {
    throw new ValidationError(400, "Bad Request", "Typed CEP is invalid");
  }

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json`);

    if (response.data.erro) {
      throw new ValidationError(404, "Not Found", "CEP not found");
    }
    return response.data;
  } catch (error) {
    throw new ValidationError(
      500,
      "Internal Server Error",
      "Error fetching data from ViaCEP API",
    );
  }
}
