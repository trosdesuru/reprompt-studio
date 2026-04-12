import { test, expect } from "@playwright/test";

test.describe("Flujo de Autenticación Crítica (E2E Real)", () => {
  test("El administrador puede hacer login y acceder al Terminal", async ({ page }) => {
    await page.goto("http://localhost:3000/es/login", { waitUntil: "networkidle" });

    await page.getByRole("textbox", { name: "EMAIL O USUARIO" }).fill("admin_e2e");
    await page.getByRole("textbox", { name: "••••••••" }).fill("E2E_Secure_Pass_123!");

    const loginButton = page.getByRole("button", { name: "Entrar" });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    await expect(page).toHaveURL(/.*\/studio/, { timeout: 15000 });
  });

  test("Un usuario no puede entrar con credenciales falsas", async ({ page }) => {
    await page.goto("http://localhost:3000/es/login", { waitUntil: "networkidle" });

    await page.getByRole("textbox", { name: "EMAIL O USUARIO" }).fill("admin_e2e");
    await page.getByRole("textbox", { name: "••••••••" }).fill("ClaveFalsa123");

    await page.getByRole("button", { name: "Entrar" }).click();

    const errorMessage = page.getByRole("status");
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
