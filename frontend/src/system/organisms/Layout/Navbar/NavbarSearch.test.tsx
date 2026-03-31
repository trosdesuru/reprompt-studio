import { render, screeen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"; // 🛡️ FIX 1: Importamos los matchers del DOM para TS

import { NavbarSearch } from "./NavbarSearch";
import { useSearch } from "@/src/features/search/hooks/useSearch";

// Aislamos el componente para no hacer peticiones reales
jest.mock("@/src/features/search/hooks/useSearch");
const mockUseSearch = useSearch as jest.MockedFunction<typeof useSearch>;

describe("Organism: NavbarSearch", () => {
  // 🛡️ FIX 2: Completamos el contrato estricto de TypeScript
  const defaultMockState = {
    query: "",
    setQuery: jest.fn(),
    handleSearch: jest.fn((e) => {
      if (e?.preventDefault) e.preventDefault();
      return Promise.resolve();
    }),
    isLoading: false,
    activeCategories: { misc: true },
    toggleCategory: jest.fn(),
    // Añadimos las propiedades faltantes para calmar a TypeScript
    results: [],
    isLoadingMore: false,
    hasMore: false,
    error: null,
    loadMore: jest.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Forzamos el tipado any temporal si TS sigue siendo excesivamente estricto
    // con firmas de funciones complejas
    mockUseSearch.mockReturnValue(defaultMockState as any);
  });

  describe("Renderizado Inicial", () => {
    it("debe renderizar el input de búsqueda correctamente", () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);
      expect(input).toBeInTheDocument();
    });
  });

  describe("Interacción del Usuario (Happy Path)", () => {
    it("debe llamar a setQuery cuando el usuario escribe", async () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);

      await userEvent.type(input, "Cyberpunk");

      // Verificamos que Zustand reciba las actualizaciones
      expect(defaultMockState.setQuery).toHaveBeenCalledWith("C");
      expect(defaultMockState.setQuery).toHaveBeenCalledWith("Cyberpunk");
    });

    it("debe llamar a handleSearch EXACTAMENTE UNA VEZ al enviar el formulario", async () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);

      await userEvent.type(input, "Goku{enter}");

      expect(defaultMockState.handleSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Casos Límite y UX Avanzada (Edge Cases)", () => {
    it("debe desactivar el botón de búsqueda si está cargando (isLoading: true)", () => {
      mockUseSearch.mockReturnValue({ ...defaultMockState, isLoading: true } as any);

      render(<NavbarSearch />);
      // Buscamos el botón por su tipo de rol y atributo submit
      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
    });

    it('atajo de teclado "/": debe hacer focus en el input sin escribir la barra', async () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);

      fireEvent.keyDown(window, { key: "/" });

      expect(input).toHaveFocus();
      expect(defaultMockState.setQuery).not.toHaveBeenCalledWith("/");
    });
  });
});
