// import Navbar from "./components/Navbar"
// import Hero from "./components/Hero"
// import About from "./components/About"
// import Features from "./components/Features"
// import Gallery from "./components/Gallery"
// import CTA from "./components/CTA"
// import Footer from "./components/Footer"

// function App() {

//   return (

//     <div className="bg-[#061224] overflow-hidden">

//       <Navbar />

//       <Hero />

//       <About />

//       <Features />

//       <Gallery />

//       <CTA />

//       <Footer />

//     </div>

//   )

// }

// export default App

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import About from "./components/About";
import Gallery from "./components/Gallery";
import CTA from "./components/CTA";

// Pages
import Home from "./pages/Home";
import Admissions from "./pages/Admissions";
import Admin from "./pages/Admin";

// New Pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

// Academics Page
function AcademicsPage() {
  return (
    <div className="pt-32 px-6 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">Academics</h1>

        <p className="text-gray-300 text-lg leading-8 max-w-3xl">
          Enlightened Bharat focuses on modern CBSE education with Gurukul
          values, smart learning, discipline, conceptual clarity and holistic
          student development.
        </p>
      </div>
    </div>
  );
}

// Contact Page
function ContactPage() {
  return (
    <div className="pt-32">
      <CTA />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#061224] min-h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Routes */}
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* About */}
          <Route path="/about" element={<About />} />

          {/* Gallery */}
          <Route path="/gallery" element={<Gallery />} />

          {/* Academics */}
          <Route path="/academics" element={<AcademicsPage />} />

          {/* Contact */}
          <Route path="/contact" element={<ContactPage />} />

          {/* Admissions */}
          <Route path="/admissions" element={<Admissions />} />

          {/* Admin */}
          <Route path="/admin" element={<Admin />} />

          {/* Privacy Policy */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Terms & Conditions */}
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
        </Routes>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
