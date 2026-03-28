interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  paginas: number;
  setPaginas: (p: number) => void;
  cargando: boolean;
  onSearch: (e: React.FormEvent) => void;
}

export default function SearchBar({
  query,
  setQuery,
  paginas,
  setPaginas,
  cargando,
  onSearch,
}: SearchBarProps) {
  return (
    <form
      onSubmit={onSearch}
      className="flex flex-col sm:flex-row gap-3 shadow-xl bg-gray-800 p-3 rounded-xl border border-gray-700"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej: Chun Li..."
        className="flex-1 p-3 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none text-white text-lg"
        disabled={cargando}
      />
      <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-4">
        <span className="text-gray-400 mr-2">Páginas:</span>
        <input
          type="number"
          min="1"
          max="50"
          value={paginas}
          onChange={(e) => setPaginas(Number(e.target.value))}
          className="w-12 bg-transparent outline-none text-white text-center font-bold"
          disabled={cargando}
        />
      </div>
      <button
        type="submit"
        disabled={cargando || !query}
        className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded font-bold disabled:bg-gray-600 text-lg"
      >
        Buscar
      </button>
    </form>
  );
}
