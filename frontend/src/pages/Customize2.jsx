import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer"

function Customize2() {

  const {
    userData,
    backendImage,
    selectedImage,
    serverUrl,
    setUserData
  } = useContext(userDataContext)

  const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleUpdateAssistant = async () => {

    // 🔥 VALIDATION (IMPORTANT)
    if (!assistantName) {
      return setError("Please enter assistant name")
    }

    if (!backendImage && !selectedImage) {
      return setError("Please select an image")
    }

    setLoading(true)
    setError("")

    try {
      let formData = new FormData()

      formData.append("assistantName", assistantName)

      if (backendImage) {
        formData.append("assistantImage", backendImage)
      } else {
        formData.append("imageUrl", selectedImage)
      }

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials: true }
      )

      setUserData(result.data)
      navigate("/")

    } catch (error) {
      console.log(error)
      setError(error?.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative'>

      <MdKeyboardBackspace
        className='absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px]'
        onClick={() => navigate("/customize")}
      />

      <h1 className='text-white mb-[40px] text-[30px] text-center'>
        Enter Your <span className='text-blue-200'>Assistant Name</span>
      </h1>

      <input
        type="text"
        placeholder='eg. Jarvis'
        className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {/* 🔴 ERROR MESSAGE */}
      {error && <p className='text-red-500 mt-[10px]'>{error}</p>}

      {assistantName && (
        <button
          className='min-w-[300px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px]'
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {loading ? "Loading..." : "Finally Create Your Assistant"}
        </button>
      )}

      <Footer />
    </div>
  )
}

export default Customize2