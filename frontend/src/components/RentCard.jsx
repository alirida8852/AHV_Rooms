function RentCard({ rent }) {
  return (
    <div
      className={`rounded-xl shadow-md p-5 border-l-4 ${
        rent.status === "Overdue"
          ? "bg-red-50 border-red-600"
          : "bg-yellow-50 border-yellow-500"
      }`}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        <div>
          <h2 className="text-2xl font-bold">
            {rent.tenant}
          </h2>

          <p>📞 {rent.phone}</p>

          <p className="text-gray-600 mt-2">
            {rent.pg} • Room {rent.room} • Bed {rent.bed}
          </p>
        </div>

        <div className="text-right">

          <h2 className="text-3xl font-bold">
            ₹{rent.rent}
          </h2>

          <p className="mt-2">
            Due Day: <strong>{rent.due_day}</strong>
          </p>

          {rent.status === "Overdue" && (
            <p className="text-red-600 font-semibold">
              {rent.overdue_days} days overdue
            </p>
          )}

          <span
            className={`inline-block mt-3 px-4 py-1 rounded-full text-white ${
              rent.status === "Overdue"
                ? "bg-red-600"
                : "bg-yellow-500"
            }`}
          >
            {rent.status}
          </span>

        </div>

      </div>
    </div>
  );
}

export default RentCard;