function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 border">
      <h3 className="text-gray-500 text-sm font-medium">
        {title}
      </h3>

      <h1 className="text-3xl font-bold mt-4 text-slate-800">
        {value}
      </h1>
    </div>
  );
}

export default StatCard;