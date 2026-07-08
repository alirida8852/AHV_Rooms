function Navbar() {
  return (
    <div className="flex justify-between items-center bg-white px-8 py-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
        Logout
      </button>
    </div>
  );
}

export default Navbar;