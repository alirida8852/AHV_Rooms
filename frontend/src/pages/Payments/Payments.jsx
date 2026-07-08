import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function Payments() {
  const [payments, setPayments] = useState([]);

  const loadPayments = () => {
    api
      .get("/payment/due")
      .then((res) => setPayments(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const receivePayment = async (id) => {
    try {
      await api.post(`/payment/pay/${id}`);

      alert("Payment Received");

      loadPayments();
    } catch (err) {
      console.log(err);
      alert("Already Paid");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Payments
      </h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>

              <th className="p-3">Tenant</th>

              <th>PG</th>

              <th>Room</th>

              <th>Bed</th>

              <th>Month</th>

              <th>Rent</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {payments.map((payment) => (

              <tr
                key={payment.payment_id}
                className="border-b text-center"
              >

                <td className="p-3">
                  {payment.tenant}
                </td>

                <td>{payment.pg}</td>

                <td>{payment.room}</td>

                <td>{payment.bed}</td>

                <td>{payment.month}</td>

                <td>₹{payment.rent}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      payment.status === "Paid"
                        ? "bg-green-500"
                        : payment.status === "Due"
                        ? "bg-yellow-500"
                        : payment.status === "Overdue"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {payment.status}
                  </span>

                </td>

                <td>

                  {payment.status !== "Paid" && (

                    <button
                      onClick={() =>
                        receivePayment(payment.payment_id)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Receive
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}

export default Payments;