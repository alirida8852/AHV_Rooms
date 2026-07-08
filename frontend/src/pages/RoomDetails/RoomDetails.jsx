import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [pgId, setPgId] = useState(null);

  const loadRoom = async () => {
    try {
      const res = await api.get(`/room/${roomId}/details`);
      setRoom(res.data);
      setPgId(res.data.pg_id);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const receivePayment = async (paymentId) => {
    try {
      await api.post(`/payment/pay/${paymentId}`);

      alert("Payment Received Successfully");
      loadRoom();

    } catch (err) {
      alert(err.response?.data?.detail || "Payment Failed");
    }
  };

  const goBack = () => {
    navigate(`/pg/${pgId}/rooms`, { replace: true });
  };

  if (!room) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold">Loading...</h1>
      </DashboardLayout>
    );
  }

  const sharing =
    room.capacity === 1
      ? "Single Sharing"
      : room.capacity === 2
      ? "Double Sharing"
      : "Triple Sharing";

  return (
    <DashboardLayout>
      {/* BACK BUTTON FIXED */}
      <button
        onClick={goBack}
        className="mb-6 text-blue-600 hover:underline"
      >
        ← Back to Rooms
      </button>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h1 className="text-4xl font-bold">
          Room {room.room_number}
        </h1>

        <p className="text-gray-500 mt-2">
          {sharing}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-gray-500">Floor</p>
            <h3>{room.floor}</h3>
          </div>

          <div>
            <p className="text-gray-500">Rent</p>
            <h3>₹{room.rent}</h3>
          </div>

          <div>
            <p className="text-gray-500">Beds</p>
            <h3>{room.capacity}</h3>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-5">Beds</h2>

      <div className="space-y-6">
        {room.beds.map((bed) => (
          <div
            key={bed.bed_id}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">
                Bed {bed.bed_number}
              </h2>

              <span>{bed.status}</span>
            </div>

            {bed.tenant ? (
              <>
                <hr className="my-4" />

                <h3 className="text-xl font-semibold">
                  {bed.tenant.name}
                </h3>

                <p>📞 {bed.tenant.phone}</p>

                <div className="mt-5">
                  <h3 className="font-bold mb-3">Payments</h3>

                  {bed.tenant.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border p-4 rounded-lg flex justify-between"
                    >
                      <div>
                        <p>{payment.month}</p>
                        <p>₹{payment.amount}</p>
                        <p>Status: {payment.status}</p>
                      </div>

                      {payment.status !== "Paid" && (
                        <button
                          onClick={() =>
                            receivePayment(payment.id)
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    navigate(`/room/${roomId}/bed/${bed.bed_id}/checkout`, {
                      replace: true
                    })
                  }
                  className="mt-6 bg-red-600 text-white px-5 py-2 rounded-lg"
                >
                  Checkout
                </button>
              </>
            ) : (
              <button
                onClick={() =>
                  navigate(`/room/${roomId}/bed/${bed.bed_id}/assign`, {
                    replace: true
                  })
                }
                className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg"
              >
                Assign Tenant
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default RoomDetails;