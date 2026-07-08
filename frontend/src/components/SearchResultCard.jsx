function SearchResultCard({ result }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold">
            {result.name}
          </h2>

          <p className="text-gray-500">
            {result.type}
          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5">

        <div>
          <p className="text-gray-500">Phone</p>
          <h3>{result.phone}</h3>
        </div>

        <div>
          <p className="text-gray-500">PG</p>
          <h3>{result.pg}</h3>
        </div>

        <div>
          <p className="text-gray-500">Room</p>
          <h3>{result.room}</h3>
        </div>

        <div>
          <p className="text-gray-500">Bed</p>
          <h3>{result.bed}</h3>
        </div>

      </div>

    </div>
  );
}

export default SearchResultCard;