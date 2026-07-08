import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PGDashboard from "./pages/PGDashboard/PGDashboard";
import RoomManagement from "./pages/RoomManagement/RoomManagement";
import BedManagement from "./pages/BedManagement/BedManagement";
import RoomDetails from "./pages/RoomDetails/RoomDetails";
import AssignTenant from "./pages/AssignTenant/AssignTenant";
import Checkout from "./pages/Checkout/Checkout";
import Expenses from "./pages/Expenses/Expenses";
import Rent from "./pages/Rent/Rent";
import Search from "./pages/Search/Search";
import Payments from "./pages/Payments/Payments";
import PGPayments from "./pages/PGPayments/PGPayments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pg/:id"
        element={
          <ProtectedRoute>
            <PGDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pg/:id/rooms"
        element={
          <ProtectedRoute>
            <RoomManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <BedManagement />
          </ProtectedRoute>
        }
      />
      <Route
      path="/room/:roomId/details"
      element={
        <ProtectedRoute>
          <RoomDetails />
        </ProtectedRoute>
      }
    />
    <Route
      path="/room/:roomId/bed/:bedId/assign"
      element={
        <ProtectedRoute>
          <AssignTenant />
        </ProtectedRoute>
      }
    />
    <Route
      path="/room/:roomId/bed/:bedId/checkout"
      element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      }
    />
    <Route
      path="/expenses"
      element={
        <ProtectedRoute>
          <Expenses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/rent"
      element={
        <ProtectedRoute>
          <Rent />
        </ProtectedRoute>
      }
    />
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payments"
      element={
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      }
    />
        <Route
      path="/pg/:id/payments"
      element={
        <ProtectedRoute>
          <PGPayments />
        </ProtectedRoute>
      }
    />
    </Routes>
  );
}

export default App;