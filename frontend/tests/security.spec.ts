import { test, expect } from "@playwright/test";

test.describe("🛡️ Batería de Pruebas de Seguridad Defensiva", () => {
  test("Defensa contra Inyección SQL Clásica en el Login", async ({ page }) => {
    await page.goto("http://localhost:3000/es/login", { waitUntil: "networkidle" });

    const sqliPayload = "' OR 1=1 --";

    await page.getByRole("textbox", { name: "EMAIL O USUARIO" }).fill(sqliPayload);
    await page.getByRole("textbox", { name: "••••••••" }).fill("cualquier_cosa");

    await page.getByRole("button", { name: "Entrar" }).click();

    const errorMessage = page.getByRole("status");
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    const response = await page.request.get("http://localhost:8000/api/auth/me");
    expect(response.status()).not.toBe(500);
  });

  test("Defensa contra XSS (Cross-Site Scripting) en inputs", async ({ page }) => {
    await page.goto("http://localhost:3000/es/login");

    const xssPayload = "<script>alert('hackeado')</script>";

    await page.getByRole("textbox", { name: "EMAIL O USUARIO" }).fill(xssPayload);
    await page.getByRole("textbox", { name: "••••••••" }).fill("password");

    await page.getByRole("button", { name: "Entrar" }).click();

    page.on("dialog", (dialog) => {
      throw new Error(
        `¡Vulnerabilidad XSS detectada! Dialog apareció con texto: ${dialog.message()}`,
      );
    });

    const errorMessage = page.getByRole("status");
    await expect(errorMessage).toBeVisible();
  });

  test("Prueba de Rate Limiting (Fuerza Bruta a la API)", async ({ request }) => {
    const maxRequests = 15;
    let rateLimitTriggered = false;

    for (let i = 0; i < maxRequests; i++) {
      const response = await request.post("http://localhost:8000/api/auth/login", {
        form: {
          username: `user_${i}`,
          password: "password_falsa",
        },
      });

      if (response.status() === 429) {
        rateLimitTriggered = true;
        break;
      }
    }
    expect(rateLimitTriggered, "El Rate Limiter no detuvo el ataque de fuerza bruta").toBe(true);
  });

  test("Control de Acceso Roto (Bypass de RBAC) hacia el Studio", async ({ page }) => {
    const response = await page.goto("http://localhost:3000/es/studio");
  });
});
