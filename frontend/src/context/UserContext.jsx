import axios from 'axios'
import React, { createContext, useEffect, useRef, useState } from 'react'
export const userDataContext=createContext()
function UserContext({children}) {
    const serverUrl="https://virtual-assistant-fxvl.onrender.com"
    const [userData,setUserData]=useState(null)
    const [frontendImage,setFrontendImage]=useState(null)
    const [backendImage,setBackendImage]=useState(null)
    const [selectedImage,setSelectedImage]=useState(null)
    const lastCallRef = useRef(0)  

    const handleCurrentUser=async ()=>{
        try {
            const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
            setUserData(result.data)
            console.log(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGeminiResponse=async (command)=>{
        const now = Date.now()
        if (now - lastCallRef.current < 3000) {  
            console.warn("Too fast! Skipping request...")  
            return null  
        }  
        lastCallRef.current = now  

        try {
            const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
            return result.data
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        handleCurrentUser()
    },[])

    const value={
        serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
    }
    return (
        <div>
            <userDataContext.Provider value={value}>
                {children}
            </userDataContext.Provider>
        </div>
    )
}

export default UserContext