import { useState } from "react";
import api from "../../services/api";

function AddRoomModal({ pgId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    room_number: "",
    floor: "",
    capacity: 1,
    rent: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/room/", {
        pg_id: Number(pgId),
        room_number: form.room_number,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
        rent: Number(form.rent),
      });

      alert("Room Created Successfully");

      onSuccess();
      onClose();

    } catch (err) {
      console.log(err);
      alert("Failed to create room");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold mb-6">
          Add Room
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            className="border w-full p-3 rounded-lg"
            placeholder="Room Number"
            name="room_number"
            onChange={handleChange}
            required
          />

          <input
            className="border w-full p-3 rounded-lg"
            type="number"
            placeholder="Floor"
            name="floor"
            onChange={handleChange}
            required
          />

          <select
            className="border w-full p-3 rounded-lg"
            name="capacity"
            onChange={handleChange}
          >
            <option value={1}>Single Sharing</option>
            <option value={2}>Double Sharing</option>
            <option value={3}>Triple Sharing</option>
          </select>

          <input
            className="border w-full p-3 rounded-lg"
            type="number"
            placeholder="Monthly Rent"
            name="rent"
            onChange={handleChange}
            required
          />

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
            >
              Create Room
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddRoomModal;