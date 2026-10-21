import { Route, Routes } from "react-router";
import { HomePage } from "./pages/Home";
import { AboutPage } from "./pages/About";
import { PeoplePage } from "./pages/People";
import { NetworkingPage } from "./pages/Networking";
import { ProjectsPage } from "./pages/Projects";
import { ProjectDetailPage } from "./pages/ProjectDetail";
import { NewsPage } from "./pages/News";
import { NewsDetailPage } from "./pages/NewsDetail";
import { ContactPage } from "./pages/Contact";
import { NotFoundPage } from "./pages/NotFound";
import { HeaderNav } from "./components/HeaderNav";
import { Footer } from './components/Footer';

export default function App() {
  return (
    <>
    <HeaderNav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/people" element={<PeoplePage />} />
        <Route path="/networking" element={<NetworkingPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HeaderNav>
    <Footer />   
    </>
  );
}
