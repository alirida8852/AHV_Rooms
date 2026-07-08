import { Link } from "react-router-dom";

function PGCard({ id, name, rooms, beds, profit }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-xl transition duration-300">
      <h2 className="text-xl font-bold text-slate-800">
        {name}
      </h2>

      <div className="mt-4 space-y-2 text-gray-600">
        <p>Rooms: {rooms}</p>
        <p>Beds: {beds}</p>
        <p>Profit: ₹{profit}</p>
      </div>

      <Link
        to={`/pg/${id}`}
        className="inline-block mt-5 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
      >
        View PG
      </Link>
    </div>
  );
}

export default PGCard;