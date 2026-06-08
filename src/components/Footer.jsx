// import logo from "../assets/logo.png"
// function Footer() {

//   return (

//     <footer className="mt-20 bg-black/20 backdrop-blur-lg px-6 py-10">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
//             <div>
//                 <img className="w-20 h-20 rounded-full mb-4 object-cover" src={logo} alt="logo"/>
//                 <h2 className="text-2xl font-bold text-white">Enlightened Bharat</h2>
//                 <p className="text-gray-300 mt-4 leading-7 max-w-sm" >Empowering students with modern education, discipline and Gurukul values.</p>
//             </div>

//             <div>
//                 <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
//                 <ul className="flex flex-col gap-3 text-gray-300">
//                     <li className="hover:text-white cursor-pointer duration-300">Home</li>
//                     <li className="hover:text-white cursor-pointer duration-300">About</li>
//                     <li className="hover:text-white cursor-pointer duration-300">Gallery</li>
//                     <li className="hover:text-white cursor-pointer duration-300">Admissions</li>
//                     <li className="hover:text-white cursor-pointer duration-300">Contact</li>

//                 </ul>
//             </div>

//             <div>
//                 <h3 className="text-xl font-semibold text-white mb-4">Contact</h3>
//                 <a className="text-gray-300 hover:text-white duration-300 block mb-3" href="https://maps.app.goo.gl/Av8eQAsdFn5izbqa8" target="_blank"> 🌎Bareilly, India</a>
//                 <p className="text-gray-300 mb-3">📞 +91 98765 43210</p>
//                 <p className="text-gray-300 mb-3">✉️info@enlightenedbharat.com</p>
//             </div>

//         </div>

//     </footer>

//   )

// }

// export default Footer

// Updated code

import logo from "../assets/logo.jpeg";
import { Link } from "react-router-dom";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-black via-[#0a0a0a] to-[#111111] border-t border-yellow-500/20 py-20 px-6 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 blur-[150px] rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full"></div>

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        {/* Logo Section */}
        <div>
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="logo"
              className="w-16 h-16 rounded-full object-cover border border-yellow-400/40"
            />

            <div>
              <h2 className="text-white text-2xl font-bold">
                Enlightened Bharat
              </h2>

              <p className="text-yellow-400 tracking-[4px] uppercase text-xs mt-1">
                Gurukul
              </p>
            </div>
          </div>

          <p className="text-gray-400 leading-8 mt-6">
            Modern Education with Vedic values. Building future-ready leaders
            through wisdom, discipline, character and excellence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-2xl font-semibold mb-6">
            Quick Links
          </h3>

          <ul className="space-y-4">
            {["Home", "About", "Academics", "Gallery", "Contact"].map(
              (item) => (
                <li key={item} className="group cursor-pointer w-fit">
                  <span className="text-gray-400 group-hover:text-yellow-400 duration-300">
                    {item}
                  </span>

                  <div className="w-0 h-[2px] bg-yellow-400 group-hover:w-full duration-300"></div>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white text-2xl font-semibold mb-6">Contact Us</h3>

          <div className="space-y-5 text-gray-400">
            <a
              href="https://maps.app.goo.gl/EREyA2k3sLRs2b8d6"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 hover:text-yellow-400 duration-300"
            >
              <FaMapMarkerAlt className="text-yellow-400 mt-1" />

              <span>Enlightened Bharat Gurukul</span>
            </a>

            <p className="flex items-center gap-3">
              <FaPhoneAlt className="text-yellow-400" />
              +91 9876543210
            </p>

            <p className="flex items-center gap-3">
              <FaEnvelope className="text-yellow-400" />
              info@enlightenedbharat.com
            </p>
          </div>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-white text-2xl font-semibold mb-6">Follow Us</h3>

          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full border border-yellow-400/20 bg-white/5 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black duration-300"
            >
              <FaInstagram size={22} />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full border border-yellow-400/20 bg-white/5 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black duration-300"
            >
              <FaYoutube size={22} />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full border border-yellow-400/20 bg-white/5 flex items-center justify-center text-white hover:bg-yellow-400 hover:text-black duration-300"
            >
              <FaFacebookF size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500 text-center md:text-left">
          © 2026 Enlightened Bharat Gurukul. All Rights Reserved.
        </p>

        <div className="flex gap-6 mt-4 md:mt-0">
          <Link
            to="/privacy-policy"
            className="text-gray-500 hover:text-yellow-400 duration-300"
          >
            Privacy Policy
          </Link>

          <Link
            to="/terms-and-conditions"
            className="text-gray-500 hover:text-yellow-400 duration-300"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
