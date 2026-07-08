import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function RoomCard({ room, refreshRooms }) {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    pg_id: room.pg_id,
    room_number: room.room_number,
    floor: room.floor,
    capacity: room.capacity,
    rent: room.rent,
  });

  const sharing =
    room.capacity === 1
      ? "Single Sharing"
      : room.capacity === 2
      ? "Double Sharing"
      : "Triple Sharing";

  const handleUpdate = async () => {
    try {
      await api.put(`/room/${room.id}`, {
        pg_id: Number(form.pg_id),
        room_number: form.room_number,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
        rent: Number(form.rent),
      });

      alert("Room Updated");
      setEditing(false);
      refreshRooms();
    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this room?")) return;

    try {
      await api.delete(`/room/${room.id}`);

      alert("Room Deleted");

      refreshRooms();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.detail || "Cannot delete room");
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Edit Room
        </h2>

        <div className="space-y-3">

          <input
            className="border p-2 rounded w-full"
            value={form.room_number}
            onChange={(e) =>
              setForm({ ...form, room_number: e.target.value })
            }
            placeholder="Room Number"
          />

          <input
            className="border p-2 rounded w-full"
            type="number"
            value={form.floor}
            onChange={(e) =>
              setForm({ ...form, floor: e.target.value })
            }
            placeholder="Floor"
          />

          <input
            className="border p-2 rounded w-full"
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: e.target.value })
            }
            placeholder="Capacity"
          />

          <input
            className="border p-2 rounded w-full"
            type="number"
            value={form.rent}
            onChange={(e) =>
              setForm({ ...form, rent: e.target.value })
            }
            placeholder="Rent"
          />

          <div className="flex gap-3">

            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border p-6">

      <div
        className="cursor-pointer"
        onClick={() => navigate(`/room/${room.id}/details`)}
      >

        <h2 className="text-2xl font-bold">
          Room {room.room_number}
        </h2>

        <p className="text-gray-500 mt-2">
          {sharing}
        </p>

        <div className="mt-4 space-y-1">

          <p>🏢 Floor {room.floor}</p>

          <p>🛏 Capacity {room.capacity}</p>

          <p>💰 ₹{room.rent}/month</p>

        </div>

      </div>

      <div className="flex gap-3 mt-6">

        <button
          onClick={() => setEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>

      </div>

    </div>
  );
}

export default RoomCard;