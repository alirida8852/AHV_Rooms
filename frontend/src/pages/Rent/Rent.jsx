import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RentCard from "../../components/RentCard";
import api from "../../services/api";

function Rent() {
  const [rentData, setRentData] = useState([]);

  useEffect(() => {
    loadRent();
  }, []);

  const loadRent = async () => {
    try {
      const res = await api.get("/rent/rent-due");
      setRentData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalPending = rentData.reduce(
    (sum, item) => sum + item.rent,
    0
  );

  const overdueCount = rentData.filter(
    (r) => r.status === "Overdue"
  ).length;

  const dueCount = rentData.filter(
    (r) => r.status === "Due"
  ).length;

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-8">
        Rent Due
      </h1>

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Pending Rent</p>
          <h2 className="text-3xl font-bold">
            ₹{totalPending}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Due</p>
          <h2 className="text-3xl font-bold">
            {dueCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500">Overdue</p>
          <h2 className="text-3xl font-bold text-red-600">
            {overdueCount}
          </h2>
        </div>

      </div>

      <div className="space-y-5">
        {rentData.map((rent, index) => (
          <RentCard
            key={index}
            rent={rent}
          />
        ))}
      </div>

    </DashboardLayout>
  );
}

export default Rent;