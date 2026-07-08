import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function Dashboard() {

  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [pgs, setPgs] = useState([]);

  const [sharing, setSharing] = useState("1");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    owner_name: "",
    phone: ""
  });

  useEffect(() => {
    loadDashboard();
    loadPGs();
  }, []);

  const loadDashboard = async () => {
    try {

      const res = await api.get("/dashboard/");

      setDashboard(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const loadPGs = async () => {
    try {

      const res = await api.get("/pg/");

      setPgs(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {

    setEditing(null);

    setForm({
      name: "",
      address: "",
      owner_name: "",
      phone: ""
    });

  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const savePG = async () => {

    if (
      !form.name ||
      !form.address ||
      !form.owner_name ||
      !form.phone
    ) {
      alert("Please fill all fields");
      return;
    }

    try {

      if (editing) {
        await api.put(`/pg/${editing}`, form);
      } else {
        await api.post("/pg/", form);
      }

      resetForm();

      loadDashboard();
      loadPGs();

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Something went wrong"
      );

    }

  };

  const editPG = (pg) => {

  setEditing(pg.id);

  setForm({
    name: pg.name,
    address: pg.address,
    owner_name: pg.owner_name,
    phone: pg.phone
  });

  // Scroll to the Add/Edit PG form
  const formSection = document.getElementById("pg-form");

  if (formSection) {
    formSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

};

  const deletePG = async (id) => {

    if (!window.confirm("Delete this PG?")) return;

    try {

      await api.delete(`/pg/${id}`);

      if (editing === id) {
        resetForm();
      }

      loadDashboard();
      loadPGs();

    } catch (err) {

      alert(
        err.response?.data?.detail ||
        "Cannot delete PG"
      );

    }

  };

  const searchRooms = async () => {

    try {

      const res = await api.get("/availability", {
        params: {
          sharing
        }
      });

      setResults(res.data);
      setSearched(true);

    } catch (err) {

      console.log(err);

      setResults([]);
      setSearched(true);

    }

  };

  const handleSearchKeyDown = (e) => {

    if (e.key === "Enter") {
      searchRooms();
    }

  };

  const handleFormKeyDown = (e) => {

    if (e.key !== "Enter") return;

    e.preventDefault();

    const inputs = Array.from(
      document.querySelectorAll(".pg-input")
    );

    const index = inputs.indexOf(e.target);

    if (index < inputs.length - 1) {
      inputs[index + 1].focus();
    } else {
      savePG();
    }

  };

  if (!dashboard) {

    return (

      <DashboardLayout>

        <div className="flex items-center justify-center h-72">

          <h1 className="text-2xl font-bold animate-pulse">
            Loading Dashboard...
          </h1>

        </div>

      </DashboardLayout>

    );

  }

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

          <div>

            <h1 className="text-3xl md:text-4xl font-bold">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-1">
              Manage all your PGs from one place
            </p>

          </div>

        </div>

        {/* Search Rooms */}

        <div className="bg-white rounded-3xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-5">
            Search Available Rooms
          </h2>

          <div className="flex flex-col md:flex-row gap-4">

            <select
              value={sharing}
              onChange={(e) => setSharing(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="border rounded-xl p-4 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >

              <option value="1">
                Single Sharing
              </option>

              <option value="2">
                Double Sharing
              </option>

              <option value="3">
                Triple Sharing
              </option>

            </select>

            <button
              onClick={searchRooms}
              className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl px-8 py-4 w-full md:w-auto transition"
            >

              Search

            </button>

          </div>

        </div>

                {/* Search Results */}

        {searched && results.length === 0 && (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

            <div className="text-6xl mb-4">
              🛏️
            </div>

            <h3 className="text-2xl font-bold">
              No Rooms Available
            </h3>

            <p className="text-gray-500 mt-2">
              Try another sharing type.
            </p>

          </div>

        )}

        {results.length > 0 && (

          <div>

            <h2 className="text-2xl font-bold mb-5">
              Available Rooms
            </h2>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {results.map((room) => (

                <div
                  key={room.room_id}
                  className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h3 className="text-xl font-bold">
                        {room.pg}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        Room {room.room_number}
                      </p>

                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ₹{room.rent}
                    </span>

                  </div>

                  <div className="mt-5">

                    <p className="font-medium">
                      Available Beds
                    </p>

                    <div className="mt-2 bg-gray-200 rounded-full h-3">

                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{
                          width: `${(room.available_beds / room.total_beds) * 100}%`
                        }}
                      />

                    </div>

                    <p className="mt-2 text-gray-600">
                      {room.available_beds} / {room.total_beds}
                    </p>

                  </div>

                  <button
                    onClick={() => navigate(`/pg/${room.pg_id}`)}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                  >
                    Open PG
                  </button>

                </div>

              ))}

            </div>

          </div>

        )}
 {/* Your PGs */}

        <div>

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold">
              Your PGs
            </h2>

          </div>

          {pgs.length === 0 ? (

            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">

              <div className="text-6xl">
                🏠
              </div>

              <h3 className="text-2xl font-bold mt-4">
                No PG Added Yet
              </h3>

              <p className="text-gray-500 mt-2">
                Add your first PG below.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {pgs.map((pg) => (

                <div
                  key={pg.id}
                  className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
                >

                  <h3 className="text-2xl font-bold">
                    {pg.name}
                  </h3>

                  <p className="text-gray-500 mt-3">
                    📍 {pg.address}
                  </p>

                  <p className="mt-2">
                    👤 {pg.owner_name}
                  </p>

                  <p className="mt-1">
                    📞 {pg.phone}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-6">

                    <button
                      onClick={() => navigate(`/pg/${pg.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => editPG(pg)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deletePG(pg.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

{/* Add / Edit PG */}

          <div
  id="pg-form"
  className="bg-white rounded-2xl shadow-md p-6"
>

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              {editing ? "Edit PG" : "Add New PG"}
            </h2>

            {editing && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                Editing
              </span>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              type="text"
              name="name"
              placeholder="PG Name"
              value={form.name}
              onChange={handleChange}
              onKeyDown={handleFormKeyDown}
              className="pg-input border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              onKeyDown={handleFormKeyDown}
              className="pg-input border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              name="owner_name"
              placeholder="Owner Name"
              value={form.owner_name}
              onChange={handleChange}
              onKeyDown={handleFormKeyDown}
              className="pg-input border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              onKeyDown={handleFormKeyDown}
              className="pg-input border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">

            <button
              onClick={savePG}
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-semibold transition"
            >
              {editing ? "Update PG" : "Add PG"}
            </button>

            {editing && (

              <button
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-semibold transition"
              >
                Cancel
              </button>

            )}

          </div>

          <p className="text-sm text-gray-500 mt-5 text-center">
            💡 Tip: Press <span className="font-semibold">Enter</span> to move to the next field.
            Press <span className="font-semibold">Enter</span> on the last field to save automatically.
          </p>

        </div>

      </div>

       

        {/* Dashboard Summary */}

<div className="bg-white rounded-3xl shadow-lg p-6 mt-8">

  <h2 className="text-2xl font-bold mb-5">
    Dashboard Summary
  </h2>

  <div className="space-y-4">

    <div className="flex justify-between border-b pb-3">
      <span>Total PGs</span>
      <span className="font-semibold">
        {dashboard.total_pgs}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Rent Income</span>
      <span className="font-semibold text-green-600">
        ₹{dashboard.rent_income}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Food Income</span>
      <span className="font-semibold text-green-600">
        ₹{dashboard.food_income}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Deposit Held</span>
      <span className="font-semibold">
        ₹{dashboard.deposit_held}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Maintenance Earned</span>
      <span className="font-semibold">
        ₹{dashboard.maintenance_income}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Total Income</span>
      <span className="font-semibold text-green-600">
        ₹{dashboard.total_income}
      </span>
    </div>

    <div className="flex justify-between border-b pb-3">
      <span>Expenses</span>
      <span className="font-semibold text-red-600">
        ₹{dashboard.expenses}
      </span>
    </div>

    <div className="flex justify-between text-lg pt-2">
      <span className="font-bold">
        Profit
      </span>

      <span className="font-bold text-green-600">
        ₹{dashboard.profit}
      </span>
    </div>

  </div>

</div>



        

    </DashboardLayout>

  );

}

export default Dashboard;