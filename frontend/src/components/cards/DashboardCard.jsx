function DashboardCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition">
      <h3 className="text-gray-500 text-sm font-medium">
        {title}
      </h3>

      <h1 className="text-4xl font-bold text-slate-800 mt-3">
        {value}
      </h1>
    </div>
  );
}

export default DashboardCard;