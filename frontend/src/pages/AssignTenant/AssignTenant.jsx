import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";

function AssignTenant() {
  const { bedId, roomId, pgId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaar: "",
    move_in: "",
    move_out: "",
    deposit: "",
    food: "Yes",
    guest_registration_no: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      bed_id: Number(bedId),

      name: form.name,
      phone: form.phone,
      email: form.email || null,
      aadhaar: form.aadhaar || null,

      move_in: form.move_in,
      move_out: form.move_out || null,

      deposit: Number(form.deposit),

      food: form.food,
      guest_registration_no: form.guest_registration_no,
    };

    try {
      await api.post("/booking/", bookingData);

      alert("Tenant Assigned Successfully");

      navigate(`/room/${roomId}`, {
        replace: true,
      });
    } catch (err) {
      console.error(err.response?.data);

      alert(
        err.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : "Error assigning tenant"
      );
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Assign Tenant
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 max-w-xl"
      >
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="aadhaar"
          placeholder="Aadhaar"
          value={form.aadhaar}
          onChange={handleChange}
        />

        <div>
        <label className="text-sm font-medium">Move In Date</label>
        <input
          type="date"
          name="move_in"
          value={form.move_in}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <p className="text-xs text-gray-500">Date tenant is joining</p>
      </div>

      <div>
        <label className="text-sm font-medium">Move Out Date (optional)</label>
        <input
          type="date"
          name="move_out"
          value={form.move_out}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />
        <p className="text-xs text-gray-500">Leave empty if unknown</p>
      </div>

        <input
          type="number"
          name="deposit"
          placeholder="Deposit"
          value={form.deposit}
          onChange={handleChange}
          required
        />

        <div>
        <label className="text-sm font-medium">Food Service</label>

        <select
          name="food"
          value={form.food}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="Yes">🍽️ Included (Food Provided)</option>
          <option value="No">❌ Not Included</option>
        </select>
      
        <p className="text-xs text-gray-500">
          Choose whether food is included in rent
        </p>
      </div>

        <input
          name="guest_registration_no"
          placeholder="Guest Registration No"
          value={form.guest_registration_no}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          Assign Tenant
        </button>
      </form>
    </DashboardLayout>
  );
}

export default AssignTenant;