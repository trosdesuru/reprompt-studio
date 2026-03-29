// frontend/src/utils/errors/AppErrors.ts

export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
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

export class MetadataError extends AppError {
  constructor(message: string) {
    super(message, "METADATA_PARSE_ERROR");
    this.name = "MetadataError";
  }
}
