import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import RoomCard from "../../components/cards/RoomCard";
import AddRoomModal from "../../components/modals/AddRoomModal";

function RoomManagement() {
  const { id } = useParams();

  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadRooms = () => {
    api
      .get(`/room/${id}`)
      .then((res) => setRooms(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadRooms();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">

        <h1 className="text-4xl font-bold">
          Rooms
        </h1>

       <button
        onClick={() => setShowModal(true)}
        className="bg-slate-800 text-white px-5 py-3 rounded-xl hover:bg-slate-700"
      >
        + Add Room
      </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            pgId={id}
            refreshRooms={loadRooms}
          />
        ))}

      </div>
      {showModal && (
         <AddRoomModal
           pgId={id}
           onClose={() => setShowModal(false)}
           onSuccess={loadRooms}
         />
       )}
    </DashboardLayout>
  );
}

export default RoomManagement;