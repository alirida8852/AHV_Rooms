import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import SearchResultCard from "../../components/SearchResultCard";
import api from "../../services/api";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      search();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const search = async () => {
    try {
      const res = await api.get(`/search/?query=${query}`);

      setResults(res.data);
      setSearched(true);
    } catch (err) {
      console.log(err);
      setResults([]);
      setSearched(true);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Search
      </h1>

      <input
        type="text"
        placeholder="Search tenant, phone, PG, room..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded-xl p-4 mb-8"
      />

      {searched && results.length === 0 && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No rooms available.
        </div>
      )}

      <div className="space-y-5">
        {results.map((item, index) => (
          <SearchResultCard
            key={index}
            result={item}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Search;