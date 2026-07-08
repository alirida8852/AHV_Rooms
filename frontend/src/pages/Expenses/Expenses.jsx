import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import ExpenseCard from "../../components/ExpenseCard";
import api from "../../services/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [form, setForm] = useState({
    pg_id: "",
    category: "",
    amount: "",
    date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  const loadExpenses = async () => {
    try {
      const res = await api.get("/expense/");
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setForm({
      pg_id: "",
      category: "",
      amount: "",
      date: "",
      description: "",
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      pg_id: Number(form.pg_id),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description,
    };

    try {
      if (editingId) {
        await api.put(`/expense/${editingId}`, data);
      } else {
        await api.post("/expense/", data);
      }

      clearForm();
      loadExpenses();

    } catch (err) {
      console.log(err);
      alert("Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    await api.delete(`/expense/${id}`);
    loadExpenses();
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      pg_id: expense.pg_id,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const totalExpense = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold mb-6">
        Expenses
      </h1>

      <div className="bg-white rounded-xl shadow p-5 mb-8">

        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Expense" : "Add Expense"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4"
        >

          <input
            className="border p-2 rounded"
            placeholder="PG ID"
            name="pg_id"
            value={form.pg_id}
            onChange={handleChange}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Amount"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <input
            className="border p-2 rounded"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />

          <button
            className="bg-slate-800 text-white py-2 rounded hover:bg-slate-900"
          >
            {editingId ? "Update Expense" : "Add Expense"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-300 py-2 rounded"
            >
              Cancel
            </button>
          )}

        </form>

      </div>

      <div className="bg-green-100 rounded-xl p-5 mb-6">

        <h2 className="text-xl font-semibold">
          Total Expenses
        </h2>

        <h1 className="text-3xl font-bold">
          ₹{totalExpense}
        </h1>

      </div>

      <div className="grid gap-5">

        {expenses.map((expense) => (

          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

        ))}

      </div>

    </DashboardLayout>
  );
}

export default Expenses;