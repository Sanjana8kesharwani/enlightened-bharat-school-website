import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useState } from "react"

import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function Admissions() {

  const [formData, setFormData] = useState({

    studentName: "",
    fatherName: "",
    className: "",
    mobile: "",
    email: "",
    address: ""

  })

const handleSubmit = async (e) => {

  e.preventDefault()

  try {
    await addDoc(collection(db, "admissions"), {
      student_name: formData.studentName,
      father_name: formData.fatherName,
      class_name: formData.className,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      createdAt: serverTimestamp()
    })

    toast.success("Application Submitted Successfully 🎉")

    setFormData({

      studentName: "",
      fatherName: "",
      className: "",
      mobile: "",
      email: "",
      address: ""

    })

  } catch (error) {

    toast.error("Something went wrong 😢")

    console.log(error.message)

  }

}

  return (

    <section className="min-h-screen bg-gradient-to-b from-blue-950 to-black px-6 py-32">

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="text-center">

          <p className="text-yellow-400 tracking-[4px] uppercase text-sm">

            Admissions Open 2026

          </p>

          <h1 className="text-white text-5xl md:text-6xl font-bold mt-4">

            Apply For Admission

          </h1>

          <p className="text-gray-300 mt-6 max-w-2xl mx-auto leading-8">

            Begin your child’s journey with Enlightened Bharat Gurukul —
            where modern education meets discipline, wisdom and values.

          </p>

        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mt-16 shadow-2xl">

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >

            {/* Student Name */}
            <div>

              <label className="text-white block mb-3">

                Student Name

              </label>

              <input
                type="text"
                placeholder="Enter student name"
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    studentName: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              />

            </div>

            {/* Father Name */}
            <div>

              <label className="text-white block mb-3">

                Father Name

              </label>

              <input
                type="text"
                placeholder="Enter father name"
                value={formData.fatherName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fatherName: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              />

            </div>

            {/* Class */}
            <div>

              <label className="text-white block mb-3">

                Class

              </label>

              <select
                value={formData.className}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    className: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              >

                <option className="text-black">
                  Grade 6
                </option>

                <option className="text-black">
                  Grade 7
                </option>

                <option className="text-black">
                  Grade 8
                </option>

              </select>

            </div>

            {/* Mobile */}
            <div>

              <label className="text-white block mb-3">

                Mobile Number

              </label>

              <input
                type="text"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobile: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              />

            </div>

            {/* Email */}
            <div className="md:col-span-2">

              <label className="text-white block mb-3">

                Email Address

              </label>

              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              />

            </div>

            {/* Address */}
            <div className="md:col-span-2">

              <label className="text-white block mb-3">

                Address

              </label>

              <textarea
                rows="5"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value
                  })
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-yellow-400"
              ></textarea>

            </div>

            {/* Button */}
            <div className="md:col-span-2 text-center">

              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-10 py-4 rounded-full duration-300 hover:scale-[1.02] shadow-xl"
              >

                Submit Application

              </button>

            </div>

          </form>

        </div>

      </div>

    </section>

  )

}

export default Admissions