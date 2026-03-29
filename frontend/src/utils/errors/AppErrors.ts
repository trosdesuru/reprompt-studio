export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Sesión expirada o inválida") {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class ExtractionError extends AppError {
  constructor(
    message: string,
    code: "UNSUPPORTED_FORMAT" | "NO_METADATA" | "PARSE_FAILED" = "PARSE_FAILED",
  ) {
    super(message, code);
    this.name = "ExtractionError";
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}
