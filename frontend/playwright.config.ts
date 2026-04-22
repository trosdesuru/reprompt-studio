import { defineConfig, devices } from "@playwright/test";

/**
 * Ver configuración completa en: https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Ejecución en paralelo para mayor velocidad */
  fullyParallel: true,
  /* Fallar en CI si te dejas un test.only */
  forbidOnly: !!process.env.CI,
  /* Reintentos para mitigar "flakiness" en entornos con pocos recursos */
  retries: process.env.CI ? 2 : 1,
  /* Limitar workers en CI para evitar cuellos de botella */
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  /* Configuración global de los tests */
  use: {
    /* 🛡️ FIX CRÍTICO: Forzamos 127.0.0.1 para evitar el error ::1 (IPv6) */
    baseURL: "http://127.0.0.1:3000",

    /* Recolectar trazas para debuggear fallos en el reporte HTML */
    trace: "on-first-retry",
    /* Capturar pantallazo solo cuando un test falla */
    screenshot: "only-on-failure",
    /* Aumentar el tiempo de espera para encontrar elementos (bueno para el Studio) */
    actionTimeout: 10000,
  },

  /* Configuración de timeouts globales */
  timeout: 60000,
  expect: {
    timeout: 10000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /**
   * 🏗️ OPCIONAL: Descomenta esto si quieres que Playwright arranque
   * automáticamente el servidor de Next.js antes de los tests.
   */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   stdout: 'ignore',
  //   stderr: 'pipe',
  // },
});
