import Sidebar from "../components/layout/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="md:ml-64 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;