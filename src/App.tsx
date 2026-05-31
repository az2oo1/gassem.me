import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import PhotoDetails from "./pages/PhotoDetails";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<PhotoDetails />} />
          <Route path="blog" element={<Blog />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/post" element={<Admin />} />
          <Route path="admin/dashboard" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
