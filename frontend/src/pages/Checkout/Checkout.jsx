import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";

function Checkout() {
  const { bedId, roomId } = useParams();
  const navigate = useNavigate();

  const [maintenance, setMaintenance] = useState("");
  const [moveOut, setMoveOut] = useState("");

  const handleCheckout = async () => {
    if (!moveOut) {
      alert("Please select a move out date.");
      return;
    }

    try {
      const checkoutData = {
        bed_id: Number(bedId),
        maintenance_deduction: Number(maintenance || 0),
        move_out: moveOut,
      };

      await api.post("/booking/checkout", checkoutData);

      alert("Checkout Successful!");

      navigate(`/room/${roomId}`, {
        replace: true,
      });
    } catch (err) {
      console.error(err.response?.data);
      alert(
        err.response?.data?.detail
          ? JSON.stringify(err.response.data.detail)
          : "Checkout Failed"
      );
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Checkout Tenant</h1>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-md">

        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Maintenance Deduction
          </label>

          <input
            type="number"
            value={maintenance}
            onChange={(e) => setMaintenance(e.target.value)}
            className="border rounded-lg p-2 w-full"
            placeholder="Enter amount"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            Move Out Date
          </label>

          <input
            type="date"
            value={moveOut}
            onChange={(e) => setMoveOut(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <button
          onClick={handleCheckout}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-lg"
        >
          Checkout Tenant
        </button>

      </div>
    </DashboardLayout>
  );
}

export default Checkout;