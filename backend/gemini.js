import axios from "axios"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const geminiResponse = async (command, assistantName, userName, retries = 3) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL
    const apiKey = process.env.GEMINI_API_KEY  

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response>"
}

Important:
- Only respond with JSON

now your userInput- ${command}
`

    const result = await axios.post(
      `${apiUrl}?key=${apiKey}`,  
      { contents: [{ parts: [{ text: prompt }] }] }
    )

    const rawText = result.data.candidates[0].content.parts[0].text
    const cleaned = rawText.replace(/```json|```/g, "").trim()
    return cleaned

  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      console.log(`Rate limited. ${retries} retries left. Waiting 5s...`)
      await sleep(5000)
      return geminiResponse(command, assistantName, userName, retries - 1)
    }

    console.log(error)
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "Sorry, I am having trouble connecting. Please try again."
    })
  }
}

export default geminiResponse