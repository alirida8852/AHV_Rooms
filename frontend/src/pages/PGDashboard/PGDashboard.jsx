import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardCard from "../../components/cards/DashboardCard";
import api from "../../services/api";

function PGDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pg, setPg] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const [expenseData, setExpenseData] = useState({
    category: "",
    amount: "",
    date: "",
    description: ""
  });

  const loadData = async () => {
    try {
      const dashboard = await api.get(`/dashboard/${id}`);
      setPg(dashboard.data);

      const expenseRes = await api.get(`/expense/pg/${id}`);

      setExpenses(expenseRes.data.expenses);
      setTotalExpenses(expenseRes.data.total);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const clearForm = () => {
    setExpenseData({
      category: "",
      amount: "",
      date: "",
      description: ""
    });

    setEditingId(null);
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    try {

      if (editingId) {

        await api.put(
          `/expense/${editingId}`,
          {
            ...expenseData,
            pg_id: Number(id)
          }
        );

      } else {

        await api.post(
          `/expense/pg/${id}`,
          expenseData
        );

      }

      clearForm();

      loadData();

    } catch (err) {
      console.log(err);
      alert("Failed to save expense");
    }
  };

  const editExpense = (expense) => {

    setEditingId(expense.id);

    setExpenseData({
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteExpense = async (expenseId) => {

    if (!window.confirm("Delete this expense?")) {
      return;
    }

    try {

      await api.delete(`/expense/${expenseId}`);

      loadData();

    } catch (err) {

      console.log(err);

      alert("Delete failed");

    }
  };

  if (!pg) {
      return (
        <DashboardLayout>
          <h1 className="text-2xl font-bold">
            Loading...
          </h1>
        </DashboardLayout>
      );
    }
      return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold mb-8">
        {pg.pg_name}
      </h1>

      {/* Room Management */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

        <div>
          <h2 className="text-2xl font-bold">
            Room Management
          </h2>

          <p className="text-gray-500 mt-1">
            Manage all rooms and tenants
          </p>
        </div>

        <button
          onClick={() => navigate(`/pg/${id}/rooms`)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg"
        >
          View Rooms
        </button>

      </div>

      {/* Expense Form */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <h2 className="text-2xl font-bold mb-6">
          {editingId ? "Edit Expense" : "Add Expense"}
        </h2>

        <form
          onSubmit={saveExpense}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          <input
            type="text"
            placeholder="Category"
            required
            className="border rounded-lg p-3"
            value={expenseData.category}
            onChange={(e) =>
              setExpenseData({
                ...expenseData,
                category: e.target.value
              })
            }
          />

          <input
            type="number"
            placeholder="Amount"
            required
            className="border rounded-lg p-3"
            value={expenseData.amount}
            onChange={(e) =>
              setExpenseData({
                ...expenseData,
                amount: e.target.value
              })
            }
          />

          <input
            type="date"
            required
            className="border rounded-lg p-3"
            value={expenseData.date}
            onChange={(e) =>
              setExpenseData({
                ...expenseData,
                date: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Description"
            className="border rounded-lg p-3"
            value={expenseData.description}
            onChange={(e) =>
              setExpenseData({
                ...expenseData,
                description: e.target.value
              })
            }
          />

          <div className="md:col-span-2 flex gap-3">

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={clearForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* Expense History */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Expense History
          </h2>

          <h2 className="text-xl font-bold text-red-600">
            ₹{totalExpenses}
          </h2>

        </div>

        <div className="space-y-4">

          {expenses.length === 0 ? (

            <p>No expenses added.</p>

          ) : (

            expenses.map((expense) => (

              <div
                key={expense.id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >

                <div>

                  <h3 className="font-bold">
                    {expense.category}
                  </h3>

                  <p className="text-gray-500">
                    {expense.description || "-"}
                  </p>

                  <p className="text-sm text-gray-400">
                    {expense.date}
                  </p>

                </div>

                <div className="flex items-center gap-4">

                  <h3 className="font-bold">
                    ₹{expense.amount}
                  </h3>

                  <button
                    onClick={() => editExpense(expense)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

      {/* Financial Summary */}

     {/* Dashboard Summary */}

<div className="bg-white rounded-2xl shadow-md p-6 mb-8">

      <h2 className="text-2xl font-bold mb-5">
        Dashboard Summary
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between border-b pb-2">
          <span>Rent Income</span>
          <span className="font-bold">
            ₹{pg.rent_income}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Food Income</span>
          <span className="font-bold">
            ₹{pg.food_income}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Deposit Held</span>
          <span className="font-bold">
            ₹{pg.deposit_held}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Maintenance Earned</span>
          <span className="font-bold">
            ₹{pg.maintenance_income}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Total Income</span>
          <span className="font-bold">
            ₹{pg.total_income}
          </span>
        </div>

        <div className="flex justify-between border-b pb-2">
          <span>Expenses</span>
          <span className="font-bold text-red-600">
            ₹{pg.expenses}
          </span>
        </div>

        <div className="flex justify-between text-lg">

          <span className="font-bold">
            Profit
          </span>

          <span className="font-bold text-green-600">
            ₹{pg.profit}
          </span>

        </div>

      </div>

    </div>
    <button
      onClick={() =>
        window.open(
          `${import.meta.env.VITE_API_URL}/report/excel`,
          "_blank"
        )
      }
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold mt-8"
    >
      📊 Export This PG Report
    </button>

    </DashboardLayout>
  );
}

export default PGDashboard;