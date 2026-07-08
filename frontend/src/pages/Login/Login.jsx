import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";

function Login() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login(password);

      if (res.data.message === "Login Successful") {
        localStorage.setItem("isLoggedIn", true);
        navigate("/dashboard");
      } else {
        alert("Wrong password");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          StaySync Login
        </h1>

        <input
          type="password"
          placeholder="Enter password"
          className="w-full border p-3 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;