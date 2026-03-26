interface SearchFormProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function SearchForm({
  query,
  setQuery,
  onSearch,
  isLoading,
}: SearchFormProps) {
  return (
    <form
      onSubmit={onSearch}
      className="max-w-2xl mx-auto flex gap-2 mb-12 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-2xl"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 p-3 rounded bg-gray-900 border border-gray-700 outline-none focus:border-blue-500 transition-all text-white"
        placeholder="Search character, artist or tag..."
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !query}
        className="bg-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-500 transition-colors disabled:bg-gray-700"
      >
        {isLoading ? "SEARCHING..." : "SEARCH"}
      </button>
    </form>
  );
}
