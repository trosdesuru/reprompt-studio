import { test, expect } from "@playwright/test";

test.describe("Flujo de Cambio de Identidad", () => {
  test("Un usuario puede cambiar su nombre y es redirigido al login", async ({ page }) => {
    await page.goto("/es/settings/profile");

    const input = page.getByPlaceholder(/Nuevo nombre/i);
    await input.fill("Eduard_Ventos_2026");

    await page.getByRole("button", { name: /Guardar/i }).click();

    await expect(page).toHaveURL(/\/login\?updated=true/, { timeout: 10000 });

    await page.getByPlaceholder("EMAIL O USUARIO").fill("eduard_ventos_2026");

    await page.getByPlaceholder("••••••••").fill("TuPasswordSeguro123!");

    await page.getByRole("button", { name: /Entrar/i }).click();

    await expect(page).toHaveURL(/.*\/studio/, { timeout: 15000 });

    const userDisplay = page.locator("text=@eduard_ventos_2026");
    await expect(userDisplay).toBeVisible();
  });

  test("Error al intentar usar un nombre de usuario ya existente", async ({ page }) => {
    await page.goto("/es/settings/profile");

    await page.getByPlaceholder(/Nuevo nombre/i).fill("admin");
    await page.getByRole("button", { name: /Guardar/i }).click();

    const toastError = page.locator("text=Este nombre ya está en uso");
    await expect(toastError).toBeVisible();

    await expect(page).not.toHaveURL(/\/login/);
  });
});
