import api from "./api";
import type { LoginRequest } from "../types/LoginRequest";
import type { LoginResponse } from "../types/LoginResponse";

export const login = (data: LoginRequest) =>
  api.post<LoginResponse>("/usuarios/login", data);
