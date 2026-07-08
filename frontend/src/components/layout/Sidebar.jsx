import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-800 text-white p-4">
        <h2 className="text-xl font-bold">StaySync</h2>

        <button
          onClick={() => setOpen(!open)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
         className={`
          bg-slate-800 text-white
          fixed md:fixed
          top-0 left-0
          h-screen
          w-64
          p-5
          z-50
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
>
      
        <h2 className="text-2xl font-bold mb-6">
          StaySync
        </h2>

        <hr className="mb-6" />

        <nav className="space-y-4">

          <Link
            to="/dashboard"
            className="block hover:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/search"
            className="block hover:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>

          <Link
            to="/expenses"
            className="block hover:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Expenses
          </Link>
          <Link
            to="/rent"
            className="block hover:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Rent Due
          </Link>

          <Link
            to="/payments"
            className="block hover:text-blue-300"
            onClick={() => setOpen(false)}
          >
            Payments
          </Link>

        </nav>
      </div>
    </>
  );
}

export default Sidebar;