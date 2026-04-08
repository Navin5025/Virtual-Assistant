const aiResponse = async (command, assistantName, userName) => {
  try {
    const text = command.toLowerCase();

    if (text.includes("youtube")) {
      return {
        type: "youtube-search",
        userInput: command,
        response: "Opening YouTube"
      };
    }

    if (text.includes("google")) {
      return {
        type: "google-search",
        userInput: command,
        response: "Searching on Google"
      };
    }

    if (text.includes("time")) {
      return {
        type: "get-time",
        userInput: command,
        response: "Fetching current time"
      };
    }

    if (text.includes("date")) {
      return {
        type: "get-date",
        userInput: command,
        response: "Fetching today's date"
      };
    }

    if (text.includes("day")) {
      return {
        type: "get-day",
        userInput: command,
        response: "Fetching today's day"
      };
    }

    if (text.includes("month")) {
      return {
        type: "get-month",
        userInput: command,
        response: "Fetching current month"
      };
    }

    if (text.includes("calculator")) {
      return {
        type: "calculator-open",
        userInput: command,
        response: "Opening calculator"
      };
    }

    if (text.includes("instagram")) {
      return {
        type: "instagram-open",
        userInput: command,
        response: "Opening Instagram"
      };
    }

    if (text.includes("facebook")) {
      return {
        type: "facebook-open",
        userInput: command,
        response: "Opening Facebook"
      };
    }

    if (text.includes("weather")) {
      return {
        type: "weather-show",
        userInput: command,
        response: "Showing weather"
      };
    }

    return {
      type: "general",
      userInput: command,
      response: "Sorry, I didn't understand. Please try again."
    };

  } catch (error) {
    return {
      type: "general",
      userInput: command,
      response: "Something went wrong"
    };
  }
};

export default aiResponse;