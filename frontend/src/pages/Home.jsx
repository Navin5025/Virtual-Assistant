import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")

  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const isProcessingRef = useRef(false)
  const greetingDoneRef = useRef(false)

  const synth = window.speechSynthesis

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current && !isProcessingRef.current) {
      try {
        recognitionRef.current?.start()
      } catch (error) {
        if (error.name !== "InvalidStateError") console.error(error)
      }
    }
  }

  const speak = (text) => {
    if (!text) return

    const utterence = new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN'

    isSpeakingRef.current = true

    utterence.onend = () => {
      setAiText("")
      isSpeakingRef.current = false
      setTimeout(startRecognition, 800)
    }

    synth.cancel()
    synth.speak(utterence)
  }

  const handleCommand = (data) => {
    if (!data) return

    const type = data?.type || ""
    const userInput = data?.userInput || ""
    const response = data?.response || ""

    if (userInput.toLowerCase().includes("open")) {
      const input = userInput.toLowerCase().split("open")[1]?.trim()

      if (input) {
        const words = input.split(" ")
        let url = ""

        if (words.length === 1) {
          url = `https://www.${words[0]}.com`
        } else {
          url = `https://www.google.com/search?q=${encodeURIComponent(input)}`
        }

        const newTab = window.open("", "_blank")
        if (newTab) {
          newTab.location.href = url
        }

        return
      }
    }

    setAiText(response)
    speak(response)

    switch (type) {

      case 'google-search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank')
        break

      case 'youtube-search':
      case 'youtube-play': {
        const query = userInput
          .toLowerCase()
          .replace("open youtube", "")
          .replace("youtube", "")
          .trim()

        if (query) {
          window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        } else {
          window.location.href = "https://www.youtube.com"
        }
        break
      }

      case 'calculator-open':
        window.location.href = `https://www.google.com/search?q=calculator`
        break

      case 'instagram-open':
        window.location.href = `https://www.instagram.com/`
        break

      case 'facebook-open':
        window.location.href = `https://www.facebook.com/`
        break

      case 'weather-show':
        window.location.href = `https://www.google.com/search?q=weather`
        break

      default:
        break
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognitionRef.current = recognition

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
    }

    recognition.onerror = (event) => {
      recognition.stop()
    }

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      const wakeWord = userData?.assistantName || "neela"

      if (isProcessingRef.current) return

      if (transcript.toLowerCase().includes(wakeWord.toLowerCase())) {

        isProcessingRef.current = true
        setUserText(transcript)

        recognition.stop()
        setListening(false)

        try {
          await new Promise(res => setTimeout(res, 1000))

          const data = await getGeminiResponse(transcript)

          if (!data) {
            speak("Invalid response from server")
            return
          }

          handleCommand(data)
          setUserText("")

        } catch (err) {
          speak("Sorry, I am facing some issue. Please try again.")
        } finally {
          setTimeout(() => {
            isProcessingRef.current = false
          }, 1500)
        }
      }
    }

    if (!greetingDoneRef.current && userData?.name) {
      greetingDoneRef.current = true
      isSpeakingRef.current = true

      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`)
      greeting.lang = 'hi-IN'

      greeting.onend = () => {
        isSpeakingRef.current = false
        startRecognition()
      }

      synth.speak(greeting)
    }

    return () => {
      recognition.stop()
      isRecognizingRef.current = false
      setListening(false)
    }
  }, [userData])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px]'>

      <button
        className='min-w-[150px] h-[60px] text-black font-semibold absolute top-[20px] right-[20px] bg-white rounded-full'
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl'>
        <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
      </div>

      <h1 className='text-white'>I'm {userData?.assistantName}</h1>

      {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
      {aiText && <img src={aiImg} alt="" className='w-[200px]' />}

      <h1 className='text-white text-center px-4'>
  {userText || aiText || "Say your assistant name to start..."}
</h1>

<p className='text-gray-400 text-sm mt-4'>
  AI Virtual Assistant • Developed by Navin ❤️
</p>

    </div>
  )
}

export default Home