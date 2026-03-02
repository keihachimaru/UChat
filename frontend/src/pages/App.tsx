import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AuthSuccess from "@/pages/AuthSuccess";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth-success" element={<AuthSuccess/>} />
    </Routes>
  );
}