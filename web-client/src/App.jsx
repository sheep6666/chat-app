import { Routes, Route } from "react-router";
import Login from "./components/Login";
import Register from "./components/Register";
import Messenger from "./components/Messenger";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Messenger /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
