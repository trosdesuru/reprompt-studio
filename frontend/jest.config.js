const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Ruta a tu app Next.js
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Manejar los alias de importación (ej. @/src/...)
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
