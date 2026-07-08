function ExpenseCard({ expense, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">

      <div className="flex justify-between items-start flex-wrap gap-4">

        <div>

          <h2 className="text-xl font-bold">
            {expense.category}
          </h2>

          <p className="text-gray-600 mt-1">
            PG ID: {expense.pg_id}
          </p>

          <p className="text-gray-600">
            {expense.date}
          </p>

          <p className="mt-2">
            {expense.description || "No Description"}
          </p>

        </div>

        <div className="text-right">

          <h2 className="text-2xl font-bold text-red-600">
            ₹{expense.amount}
          </h2>

          <div className="mt-4 flex gap-2 justify-end">

            <button
              onClick={() => onEdit(expense)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(expense.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ExpenseCard;