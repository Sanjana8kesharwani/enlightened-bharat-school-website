

import { useEffect, useState } from "react"
import { db, storage } from "../firebase"
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function Admin() {

  const [students, setStudents] = useState([])

  // NEW STATES
  const [image, setImage] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  // SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("")

  // DELETE MODAL STATE
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null })

  // VIEW DETAILS MODAL STATE
  const [viewModal, setViewModal] = useState({ open: false, student: null })

  // LOADING STATE
  const [loading, setLoading] = useState(true)

  // UPLOAD PROGRESS STATE
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // SORTING STATE
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  // GALLERY COUNT STATE
  const [galleryCount, setGalleryCount] = useState(0)

 
  // FETCH STUDENTS
 

  const fetchStudents = async () => {
    setLoading(true)

    try {
      const querySnapshot = await getDocs(collection(db, "admissions"));
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(fetchedStudents);
      if (fetchedStudents.length > 0) {
        toast.success(`${fetchedStudents.length} admission records loaded`, { toastId: "fetch-success" })
      }
    } catch (error) {
      console.error("Admin.jsx: Firebase Error in fetchStudents:", error);
      toast.error("Failed to fetch admissions")
    } finally {
      setLoading(false)
    }

  }

  // FETCH GALLERY COUNT

  const fetchGalleryCount = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gallery"));
      setGalleryCount(querySnapshot.size);
    } catch (error) {
      console.error("Admin.jsx: Firebase Error in fetchGalleryCount:", error);
    }
  }

  // DELETE STUDENT


  const deleteStudent = async (id) => {

    try {
      await deleteDoc(doc(db, "admissions", id));
      toast.success("Admission deleted successfully")
      fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete admission")
    }

  }


  // UPLOAD IMAGE
  

  const uploadImage = async () => {

    if (!image) {

      toast.warn("Please select an image first")

      return

    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // File Name
      const fileName = `${Date.now()}-${image.name}`

      // Upload To Storage with progress tracking
      const storageRef = ref(storage, `gallery/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on("state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.log(error)
          toast.error("Failed to upload image")
          setIsUploading(false)
          setUploadProgress(0)
        },
        async () => {
          // Get Public URL
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Save In Database
          await addDoc(collection(db, "gallery"), {
            image_url: imageUrl,
            title: title,
            description: description,
            createdAt: serverTimestamp()
          });

          toast.success("Gallery image uploaded successfully")

          // Reset Fields
          setImage(null)
          setTitle("")
          setDescription("")
          setIsUploading(false)
          setUploadProgress(0)
          fetchGalleryCount()
        }
      );
    } catch (error) {
      console.log(error)
      toast.error("Failed to upload image")
      setIsUploading(false)
      setUploadProgress(0)
    }

  }

  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {

    fetchStudents()
    fetchGalleryCount()

  }, [])

  // =========================
  // SEARCH FILTER (Frontend Only)
  // =========================

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      (student.student_name || "").toLowerCase().includes(query) ||
      (student.father_name || "").toLowerCase().includes(query) ||
      (student.mobile || "").toLowerCase().includes(query) ||
      (student.email || "").toLowerCase().includes(query)
    )
  })

  // =========================
  // SORTING
  // =========================

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField) return 0

    if (sortField === "student_name") {
      const nameA = (a.student_name || "").toLowerCase()
      const nameB = (b.student_name || "").toLowerCase()
      return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    }

    if (sortField === "createdAt") {
      const dateA = a.createdAt?.seconds || 0
      const dateB = b.createdAt?.seconds || 0
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    }

    return 0
  })

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage)
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // =========================
  // ADMISSIONS TODAY
  // =========================

  const admissionsToday = students.filter((student) => {
    if (!student.createdAt?.seconds) return false
    const today = new Date()
    const studentDate = new Date(student.createdAt.seconds * 1000)
    return (
      studentDate.getDate() === today.getDate() &&
      studentDate.getMonth() === today.getMonth() &&
      studentDate.getFullYear() === today.getFullYear()
    )
  }).length

  // =========================
  // CSV EXPORT
  // =========================

  const exportCSV = () => {
    if (sortedStudents.length === 0) {
      toast.warn("No records to export")
      return
    }

    const headers = ["Student Name", "Father Name", "Class", "Mobile", "Email", "Address", "Submitted On"]
    const rows = sortedStudents.map((s) => {
      const date = s.createdAt?.seconds
        ? new Date(s.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "N/A"
      return [
        s.student_name || "",
        s.father_name || "",
        s.class_name || "",
        s.mobile || "",
        s.email || "",
        s.address || "",
        date
      ].map(field => `"${field}"`).join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `admissions_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("CSV exported successfully")
  }

  // =========================
  // DELETE MODAL HANDLERS
  // =========================

  const openDeleteModal = (student) => {
    setDeleteModal({ open: true, student })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, student: null })
  }

  const confirmDelete = () => {
    if (deleteModal.student) {
      deleteStudent(deleteModal.student.id)
    }
    closeDeleteModal()
  }

  // =========================
  // SORT ICON HELPER
  // =========================

  const SortIcon = ({ field }) => (
    <span className="inline-flex flex-col ml-1.5 -space-y-1">
      <svg className={`w-3 h-3 ${sortField === field && sortDirection === "asc" ? "text-yellow-400" : "text-gray-600"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z" /></svg>
      <svg className={`w-3 h-3 ${sortField === field && sortDirection === "desc" ? "text-yellow-400" : "text-gray-600"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
    </span>
  )

  // =========================
  // SKELETON ROW COMPONENT
  // =========================

  const SkeletonRow = () => (
    <tr className="border-b border-white/[0.06]">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-4 px-5">
          <div className="h-4 bg-white/[0.06] rounded-lg animate-pulse" style={{ width: i === 5 ? "60px" : `${60 + Math.random() * 40}%` }}></div>
        </td>
      ))}
    </tr>
  )

  // =========================
  // FORMAT DATE HELPER
  // =========================

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "N/A"
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (

    <section className="relative z-50 min-h-screen bg-[#061224] px-4 md:px-6 py-28 md:py-32">

      {/* ========== TOAST CONTAINER ========== */}
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

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {deleteModal.open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          onClick={closeDeleteModal}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"></div>
          <div
            className="relative bg-[#0c1a2e] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-xl font-bold text-center">Delete Admission?</h3>
            {deleteModal.student && (
              <p className="text-yellow-400 text-center mt-2 font-medium">{deleteModal.student.student_name}</p>
            )}
            <p className="text-gray-400 text-center mt-3 text-sm leading-relaxed">
              This action cannot be undone. The admission record will be permanently removed from the database.
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={closeDeleteModal} className="flex-1 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.97]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== VIEW DETAILS MODAL ========== */}
      {viewModal.open && viewModal.student && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          onClick={() => setViewModal({ open: false, student: null })}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"></div>
          <div
            className="relative bg-[#0c1a2e] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setViewModal({ open: false, student: null })}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Admission Details</h3>
                <p className="text-gray-500 text-xs">Complete student information</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {[
                { label: "Student Name", value: viewModal.student.student_name, color: "text-white font-medium" },
                { label: "Father Name", value: viewModal.student.father_name },
                { label: "Class", value: viewModal.student.class_name, badge: true },
                { label: "Mobile", value: viewModal.student.mobile },
                { label: "Email", value: viewModal.student.email },
                { label: "Address", value: viewModal.student.address },
                { label: "Submitted On", value: formatDate(viewModal.student.createdAt) },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium sm:w-36 shrink-0">{item.label}</span>
                  {item.badge ? (
                    <span className="bg-yellow-400/10 text-yellow-400 text-xs font-medium px-3 py-1 rounded-full w-fit">{item.value || "N/A"}</span>
                  ) : (
                    <span className={`text-sm ${item.color || "text-gray-300"}`}>{item.value || "N/A"}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <button
              onClick={() => setViewModal({ open: false, student: null })}
              className="w-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* ========== HEADING ========== */}
        <div className="text-center mb-12">
          <p className="text-yellow-400 tracking-[5px] uppercase text-xs md:text-sm font-semibold">Enlightened Bharat</p>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mt-4 leading-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-4 text-base md:text-lg max-w-2xl mx-auto">
            Manage admissions, upload gallery images, and monitor student records.
          </p>
          <div className="w-24 h-[2px] bg-yellow-400 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* ========== STATS CARDS ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-10">

          {/* Total Admissions */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-6 transition-all duration-300 hover:border-yellow-400/40 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400/80 text-xs font-medium tracking-wider uppercase">Total Admissions</p>
                <p className="text-white text-3xl font-bold mt-2">{loading ? "—" : students.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Admissions Today */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 transition-all duration-300 hover:border-blue-400/40 hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400/80 text-xs font-medium tracking-wider uppercase">Admissions Today</p>
                <p className="text-white text-3xl font-bold mt-2">{loading ? "—" : admissionsToday}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Gallery Images */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 backdrop-blur-xl border border-emerald-400/20 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(52,211,153,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400/80 text-xs font-medium tracking-wider uppercase">Gallery Images</p>
                <p className="text-white text-3xl font-bold mt-2">{galleryCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

        </div>

       
        {/* ========== GALLERY PHOTO UPLOAD ========== */}
        

        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 mt-8 transition-all duration-300 hover:border-white/15">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white text-xl md:text-2xl font-bold">
              Upload Gallery Image
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Image Title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-yellow-400/50 transition-all duration-300 placeholder:text-gray-500" />
            <input type="text" placeholder="Image Description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="bg-white/[0.06] border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-yellow-400/50 transition-all duration-300 placeholder:text-gray-500" />
          </div>

          <div className="mt-4">
            <label className="block">
              <input type="file" onChange={(e) => setImage(e.target.files[0])}
                className="text-gray-400 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-400/10 file:text-yellow-400 hover:file:bg-yellow-400/20 file:cursor-pointer file:transition-all file:duration-300" />
            </label>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs font-medium">Uploading...</span>
                <span className="text-yellow-400 text-xs font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            onClick={uploadImage}
            disabled={isUploading}
            className={`font-semibold px-8 py-3.5 rounded-xl mt-6 duration-300 active:scale-[0.98] transition-all ${isUploading ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-400 text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"}`}
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>

        </div>

        
        {/* ========== ADMISSIONS TABLE SECTION ========== */}
        

        <div className="mt-10">

          {/* Section Header + Search + Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-white text-xl md:text-2xl font-bold">
                Admission Records
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* CSV Export */}
              <button
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-5 py-2.5 text-white text-sm outline-none focus:border-blue-400/50 transition-all duration-300 placeholder:text-gray-500"
                />
              </div>
            </div>

          </div>

          {/* Table Container */}
          <div className="relative z-50 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">

            <div className="overflow-x-auto">
              <table className="w-full text-left text-white text-sm">

                <thead>
                  <tr className="bg-white/[0.06] border-b border-white/10">
                    <th
                      onClick={() => handleSort("student_name")}
                      className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap cursor-pointer hover:text-gray-200 transition-colors select-none"
                    >
                      Student Name <SortIcon field="student_name" />
                    </th>
                    <th className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
                      Father Name
                    </th>
                    <th className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
                      Class
                    </th>
                    <th className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
                      Mobile
                    </th>
                    <th className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap">
                      Email
                    </th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap cursor-pointer hover:text-gray-200 transition-colors select-none"
                    >
                      Date <SortIcon field="createdAt" />
                    </th>
                    <th className="py-4 px-5 text-xs uppercase tracking-wider text-gray-400 font-semibold whitespace-nowrap text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {loading ? (
                    // Skeleton Loading
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : paginatedStudents.length > 0 ? (

                    paginatedStudents.map((student, index) => (

                      <tr
                        key={student.id}
                        className={`border-b border-white/[0.06] hover:bg-white/[0.06] transition-all duration-200 ${index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"}`}
                      >

                        <td className="py-4 px-5 whitespace-nowrap font-medium">
                          {student.student_name}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap text-gray-300">
                          {student.father_name}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="bg-yellow-400/10 text-yellow-400 text-xs font-medium px-3 py-1 rounded-full">
                            {student.class_name}
                          </span>
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap text-gray-300">
                          {student.mobile}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap text-gray-300 max-w-[180px] truncate">
                          {student.email}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap text-gray-400 text-xs">
                          {formatDate(student.createdAt)}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewModal({ open: true, student })}
                              className="cursor-pointer bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 active:scale-95"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openDeleteModal(student)}
                              className="cursor-pointer bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95"
                            >
                              Delete
                            </button>
                          </div>
                        </td>

                      </tr>

                    ))

                  ) : (

                    /* ========== EMPTY STATE ========== */
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-base font-medium">
                            {searchQuery ? "No matching records found" : "No Admissions Found"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {searchQuery ? "Try a different search term" : "Admission records will appear here once students apply"}
                          </p>
                        </div>
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>
            </div>

            {/* Table Footer with Pagination */}
            {!loading && sortedStudents.length > 0 && (
              <div className="bg-white/[0.03] border-t border-white/[0.06] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-gray-500 text-xs">
                  Showing {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, sortedStudents.length)} of {sortedStudents.length} records
                </p>

                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${currentPage === 1 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}
                  >
                    ← Prev
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${currentPage === i + 1 ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${currentPage === totalPages ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}
                  >
                    Next →
                  </button>

                  {/* Refresh */}
                  <button
                    onClick={fetchStudents}
                    className="ml-2 text-yellow-400/70 hover:text-yellow-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                    title="Refresh data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ========== MODAL ANIMATIONS ========== */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </section>

  )

}

export default Admin