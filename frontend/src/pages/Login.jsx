import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      localStorage.setItem(
        "loginData",
        JSON.stringify(data)
      );

      let loggedInUser = null;

      if (data.user) {
        loggedInUser = data.user;
      }

      if (data.data?.user) {
        loggedInUser = data.data.user;
      }

      if (loggedInUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(loggedInUser)
        );
      }

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      if (data.data?.token) {
        localStorage.setItem(
          "token",
          data.data.token
        );
      }

      alert("Login successful!");

      // Counsellor
      if (
        loggedInUser &&
        loggedInUser.role === "counsellor"
      ) {
        navigate("/counsellor-dashboard");
      }

      // Student / other users
      else {
        navigate("/");
      }

      window.location.reload();

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.message ||
          "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            🎓
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your Get Your Seat account
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-5">
            {error}
          </div>
        )}


        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Email */}

          <label className="block font-semibold text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


          {/* Password */}

          <label className="block font-semibold text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* Counsellor Registration */}

        <div className="mt-7 border-t pt-6 text-center">

          <p className="text-gray-500">
            Are you a counsellor?
          </p>

          <Link
            to="/counsellor-register"
            className="inline-block mt-2 text-blue-600 font-semibold hover:text-blue-800 hover:underline"
          >
            👨‍⚕️ Register as Counsellor
          </Link>

        </div>


        {/* Student Registration */}

        <div className="mt-5 text-center">

          <p className="text-gray-500">
            Don't have a student account?
          </p>

          <Link
            to="/register"
            className="inline-block mt-2 text-blue-600 font-semibold hover:text-blue-800 hover:underline"
          >
            Create Student Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;