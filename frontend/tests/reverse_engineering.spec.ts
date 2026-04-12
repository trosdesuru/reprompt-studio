import { test, expect } from "@playwright/test";

test.describe("Ingeniería Inversa: Pruebas de Resiliencia", () => {
  test("A. Fallo de UX en Rate Limit (429)", async ({ page }) => {
    await page.goto("/es/login");

    // Simulamos un atacante: 6 intentos rápidos
    for (let i = 0; i < 6; i++) {
      await page.getByPlaceholder("EMAIL O USUARIO").fill("hacker_bot");
      await page.getByPlaceholder("••••••••").fill("123456");
      await page.getByRole("button", { name: /Entrar/i }).click();
    }

    // EL TEST FALLARÁ AQUÍ:
    // Actualmente verás un error genérico o nada.
    // Buscamos el mensaje específico que configuramos en Redis (Backend).
    const toast = page.locator("text=La cuenta 'hacker_bot' está bloqueada");
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test("B. Fallo de Optimización (Falsa Prioridad)", async ({ page }) => {
    await page.goto("/es");

    // Verificamos si la primera imagen del feed es un componente optimizado de Next.js
    const firstImage = page.locator("img").first();

    // EL TEST FALLARÁ AQUÍ:
    // Las imágenes de Next.js usan 'srcset' con tamaños optimizados y atributos data-nimg.
    // Tu img actual fallará esta comprobación de arquitectura profesional.
    const isNextImage = await firstImage.getAttribute("data-nimg");
    expect(isNextImage).not.toBeNull();
  });

  test("C. Consistencia de Estado tras Logout forzado", async ({ page }) => {
    await page.goto("/es/login");
    // ... asumimos login exitoso ...

    await page.evaluate(() => {
      // Forzamos un estado de "Sesión Muerta" en el cliente
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    });

    // EL TEST FALLARÁ AQUÍ:
    // Al forzar el error, el sistema debería redirigir a /login y LIMPIAR el storage.
    await expect(page).toHaveURL(/\/login/);
    const storage = await page.evaluate(() => localStorage.getItem("auth-storage"));
    expect(JSON.parse(storage!).state.user).toBeNull();
  });
});
