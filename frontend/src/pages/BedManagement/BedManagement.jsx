import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

function BedManagement() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);

  useEffect(() => {
    api.get(`/room/${roomId}/beds`)
      .then((res) => {
        setRoom(res.data);
      })
      .catch(console.error);
  }, [roomId]);

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

      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Room {room.room_number}
        </h1>

        <p className="text-gray-500 mt-2">
          {sharing}
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {room.beds.map((bed) => (

          <div
            key={bed.bed_id}
            className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-xl transition cursor-pointer"
          >

            <h2 className="text-2xl font-bold">
              Bed {bed.bed_number}
            </h2>

            <p className="mt-3">
              Status: {bed.status}
            </p>

            <p className="mt-1">
              Tenant: {bed.tenant || "Available"}
            </p>

          </div>

        ))}

      </div>

    </DashboardLayout>
  );
}

export default BedManagement;