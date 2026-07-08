import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function PGPayments() {

  const { id } = useParams();

  const [payments, setPayments] = useState([]);

  const loadPayments = () => {
    api
      .get(`/payment/pg/${id}`)
      .then((res) => setPayments(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadPayments();
  }, [id]);

  const receivePayment = async (paymentId) => {
    try {

      await api.post(`/payment/pay/${paymentId}`);

      alert("Payment Received");

      loadPayments();

    } catch (err) {

      console.log(err);
      alert("Payment Failed");

    }
  };

  return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold mb-8">
        PG Payments
      </h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>

              <th className="p-3">Tenant</th>
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

                <td className="p-3">{payment.tenant}</td>

                <td>{payment.room}</td>

                <td>{payment.bed}</td>

                <td>{payment.month}</td>

                <td>₹{payment.rent}</td>

                <td>{payment.status}</td>

                <td>

                  {payment.status !== "Paid" && (

                    <button
                      onClick={() =>
                        receivePayment(payment.payment_id)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded"
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

export default PGPayments;