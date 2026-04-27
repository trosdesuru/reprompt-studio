import "@testing-library/jest-dom";

import userEvent from "@testing-library/user-event";
import { useSearch } from "@/src/features/search/hooks/useSearch";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavbarSearch } from "../../organisms/Navigation/NavbarSearch";

jest.mock("@/src/features/search/hooks/useSearch");
const mockUseSearch = useSearch as jest.MockedFunction<typeof useSearch>;

describe("Organism: NavbarSearch", () => {
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
    results: [],
    isLoadingMore: false,
    hasMore: false,
    error: null,
    loadMore: jest.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    it("debe llamar a setQuery cuando el usuario escribe", () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);

      // 🛡️ FIX TEST: Como el mock es estático y no re-renderiza con el nuevo 'query',
      // usamos fireEvent para inyectar el valor final de golpe en lugar de userEvent (tecla a tecla)
      fireEvent.change(input, { target: { value: "Cyberpunk" } });

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

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it('atajo de teclado "/": debe hacer focus en el input sin escribir la barra', () => {
      render(<NavbarSearch />);
      const input = screen.getByPlaceholderText(/Buscar prompts/i);

      fireEvent.keyDown(window, { key: "/" });

      expect(input).toHaveFocus();
      expect(defaultMockState.setQuery).not.toHaveBeenCalledWith("/");
    });
  });
});
