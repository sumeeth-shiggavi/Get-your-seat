import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Colleges from "./pages/Colleges";
import Counsellors from "./pages/Counsellors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Predictor from "./pages/Predictor";
import CollegeDetails from "./pages/CollegeDetails";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/colleges" element={<Colleges />} />

        <Route path="/counsellors" element={<Counsellors />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/predictor/:exam"
          element={<Predictor />}
        />

        <Route
          path="/college-details"
          element={<CollegeDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;