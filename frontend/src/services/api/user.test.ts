import { userApi } from "./user";
import { fetchSeguro } from "./client";

jest.mock("./client", () => ({
  fetchSeguro: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ status: "success" }),
    }),
  ),
  API_URL: "http://localhost:8000/api",
}));

describe("userApi", () => {
  it("debe enviar un PATCH correcto para actualizar el username", async () => {
    await userApi.updateUsername("nuevo_nombre");

    expect(fetchSeguro).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me/username"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ new_username: "nuevo_nombre" }),
      }),
    );
  });
});
