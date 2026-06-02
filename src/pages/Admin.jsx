

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

function Admin() {

  const [students, setStudents] = useState([])

  // NEW STATES
  const [image, setImage] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

 
  // FETCH STUDENTS
 

  const fetchStudents = async () => {

    const { data, error } = await supabase
      .from("admissions")
      .select("*")

    if (error) {

      console.log(error)

    }

    else {

      setStudents(data)

    }

  }

  // DELETE STUDENT


  const deleteStudent = async (mobile) => {

    const { error } = await supabase
      .from("admissions")
      .delete()
      .eq("mobile", mobile)

    if (error) {

      console.log(error)

      alert("Delete Failed")

    }

    else {

      alert("Student Deleted Successfully")

      fetchStudents()

    }

  }


  // UPLOAD IMAGE
  

  const uploadImage = async () => {

    if (!image) {

      alert("Please Select Image")

      return

    }

    // File Name
    const fileName = `${Date.now()}-${image.name}`

    // Upload To Storage
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, image)

    if (uploadError) {

      console.log(uploadError)

      alert("Image Upload Failed")

      return

    }

    // Get Public URL
    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName)

    const imageUrl = data.publicUrl

    // Save In Database
    const { error: dbError } = await supabase
      .from("gallery")
      .insert([
        {
          image_url: imageUrl,
          title: title,
          description: description,
        }
      ])

    if (dbError) {

      console.log(dbError)

      alert("Database Insert Failed")

    }

    else {

      alert("Gallery Image Uploaded Successfully")

      // Reset Fields
      setImage(null)
      setTitle("")
      setDescription("")

    }

  }

  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {

    fetchStudents()

  }, [])

  return (

    <section className="relative z-50 min-h-screen bg-[#061224] px-6 py-32">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center">

          <p className="text-yellow-400 tracking-[4px] uppercase text-sm">

            Enlightened Bharat

          </p>

          <h1 className="text-white text-5xl md:text-6xl font-bold mt-4">

            Admissions Dashboard

          </h1>

        </div>

       
        {/* Gallerry Photo Upload */}
        

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mt-16">

          <h2 className="text-white text-3xl font-bold mb-8">

            Upload Gallery Image

          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Title */}
            <input
              type="text"
              placeholder="Image Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none"
            />

            {/* Description */}
            <input
              type="text"
              placeholder="Image Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border border-white/10 rounded-xl px-5 py-4 text-white outline-none"
            />

          </div>

          {/* File Input */}
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="text-white mt-6"
          />

          {/* Upload Button */}
          <button
            onClick={uploadImage}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-4 rounded-xl mt-8 duration-300"
          >

            Upload Image

          </button>

        </div>

        
        {/* Student table for records */}
        

        <div className="relative z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-16 overflow-x-auto">

          <table className="w-full text-left text-white">

            <thead>

              <tr className="border-b border-white/10">

                <th className="py-4 px-4">
                  Student
                </th>

                <th className="py-4 px-4">
                  Father
                </th>

                <th className="py-4 px-4">
                  Class
                </th>

                <th className="py-4 px-4">
                  Mobile
                </th>

                <th className="py-4 px-4">
                  Email
                </th>

                <th className="py-4 px-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {

                students.map((student) => (

                  <tr
                    key={student.mobile}
                    className="border-b border-white/10 hover:bg-white/5 duration-300"
                  >

                    <td className="py-5 px-4">

                      {student.student_name}

                    </td>

                    <td className="py-5 px-4">

                      {student.father_name}

                    </td>

                    <td className="py-5 px-4">

                      {student.class_name}

                    </td>

                    <td className="py-5 px-4">

                      {student.mobile}

                    </td>

                    <td className="py-5 px-4">

                      {student.email}

                    </td>

                    <td className="py-5 px-4">

                      <button
                        onClick={() => deleteStudent(student.mobile)}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg text-sm duration-300"
                      >

                        Delete

                      </button>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

      </div>

    </section>

  )

}

export default Admin