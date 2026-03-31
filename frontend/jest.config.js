const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Ruta a tu app Next.js
  dir: './',
})

const customJestConfig = {
  // Archivo que se ejecuta antes de las pruebas para cargar los matchers (toBeInTheDocument, etc.)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // 🛡️ FIX CRÍTICO: Simular un navegador en lugar de Node.js
  testEnvironment: 'jest-environment-jsdom',
  // Mapeo de alias para que Jest entienda las rutas con "@/"
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
