import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [loginType, setLoginType] =
    useState("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // HANDLE LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!email.trim() || !password) {
      setError(
        "Please enter email and password."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // SELECT LOGIN ENDPOINT
      // =================================================

      const endpoint =
        loginType === "counsellor"
          ? "http://localhost:5000/api/counsellor-auth/login"
          : "http://localhost:5000/api/auth/login";

      // =================================================
      // SEND LOGIN REQUEST
      // =================================================

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // =================================================
      // CHECK RESPONSE
      // =================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Login failed."
        );
      }

      // =================================================
      // GET USER
      // =================================================

      let loggedInUser = null;

      if (data.user) {
        loggedInUser = data.user;
      }

      if (data.data?.user) {
        loggedInUser =
          data.data.user;
      }

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded but user information was not received."
        );
      }

      // =================================================
      // NORMALIZE USER ID
      // =================================================
      //
      // Some backend responses may return:
      //
      // id
      //
      // while our frontend protected pages use:
      //
      // user_id
      //
      // We keep BOTH values to avoid mismatches.
      // =================================================

      const normalizedUser = {
        ...loggedInUser,

        user_id:
          loggedInUser.user_id ??
          loggedInUser.id,

        id:
          loggedInUser.id ??
          loggedInUser.user_id,
      };

      // =================================================
      // VALIDATE USER ID
      // =================================================

      if (!normalizedUser.user_id) {
        console.error(
          "USER ID MISSING FROM LOGIN RESPONSE:",
          loggedInUser
        );

        throw new Error(
          "Login succeeded but user ID was not received."
        );
      }

      // =================================================
      // GET JWT TOKEN
      // =================================================

      let token = null;

      if (data.token) {
        token = data.token;
      }

      if (data.data?.token) {
        token =
          data.data.token;
      }

      if (!token) {
        throw new Error(
          "Login succeeded but authentication token was not received."
        );
      }

      // =================================================
      // CLEAR OLD LOGIN DATA
      // =================================================

      localStorage.removeItem(
        "loginData"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "token"
      );

      // =================================================
      // SAVE LOGIN DATA
      // =================================================

      localStorage.setItem(
        "loginData",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );

      localStorage.setItem(
        "token",
        token
      );

      // =================================================
      // DEBUG INFORMATION
      // =================================================

      console.log(
        "LOGIN SUCCESS"
      );

      console.log(
        "USER:",
        normalizedUser
      );

      console.log(
        "USER ID:",
        normalizedUser.user_id
      );

      console.log(
        "USER ROLE:",
        normalizedUser.role
      );

      console.log(
        "JWT TOKEN SAVED:",
        Boolean(
          localStorage.getItem("token")
        )
      );

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      alert("Login successful!");

      // =================================================
      // ROLE-BASED REDIRECTION
      // =================================================

      if (
        normalizedUser.role ===
        "counsellor"
      ) {
        navigate(
          "/counsellor-dashboard"
        );
      } else if (
        normalizedUser.role ===
        "student"
      ) {
        navigate("/");
      } else {
        navigate("/");
      }
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

  // =====================================================
  // CHANGE LOGIN TYPE
  // =====================================================

  const handleLoginTypeChange = (
    type
  ) => {
    setLoginType(type);

    setError("");

    setEmail("");
    setPassword("");
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* HEADER */}

        <div className="text-center mb-8">

          <div className="text-5xl mb-3">
            {loginType ===
            "counsellor"
              ? "👨‍⚕️"
              : "🎓"}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Login
          </h1>

          <p className="text-gray-500 mt-2">
            Login to your Get Your Seat account
          </p>

        </div>

        {/* LOGIN TYPE */}

        <div className="mb-6">

          <label className="block font-semibold text-gray-700 mb-3">
            Login as
          </label>

          <div className="grid grid-cols-2 gap-3">

            {/* STUDENT */}

            <button
              type="button"
              onClick={() =>
                handleLoginTypeChange(
                  "student"
                )
              }
              className={`py-3 rounded-lg font-semibold border transition ${
                loginType === "student"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              🎓 Student
            </button>

            {/* COUNSELLOR */}

            <button
              type="button"
              onClick={() =>
                handleLoginTypeChange(
                  "counsellor"
                )
              }
              className={`py-3 rounded-lg font-semibold border transition ${
                loginType ===
                "counsellor"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              👨‍⚕️ Counsellor
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-5">
            ⚠️ {error}
          </div>
        )}

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label className="block font-semibold text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg p-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* PASSWORD */}

          <label className="block font-semibold text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : loginType ===
                "counsellor"
              ? "Login as Counsellor"
              : "Login as Student"}
          </button>

        </form>

        {/* COUNSELLOR REGISTRATION */}

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

        {/* STUDENT REGISTRATION */}

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