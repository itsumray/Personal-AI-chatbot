import { GoogleGenerativeAI } from "@google/generative-ai";

// !! IMPORTANT: Replace "YOUR_API_KEY" with your actual Google AI Studio API Key !!
// This key will be exposed in client-side code, which is not secure for production apps.
// For production, use a backend proxy.
const API_KEY = "AIzaSyCGx-UpojJetLfdpIZZajhzlbLPYrMjP6U"; 

if (API_KEY === "AIzaSyCGx-UpojJetLfdpIZZajhzlbLPYrMjP6U" || !API_KEY) {
    alert("Please replace 'YOUR_API_KEY' in script.js with your actual Google AI Studio API Key. The site will not function without it.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
// Using gemini-1.5-flash-latest for potentially faster responses, good for chat.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 

const sentenceInputSection = document.getElementById("sentence-input-section");
const originalSentenceTextArea = document.getElementById("original-sentence");
const submitSentenceButton = document.getElementById("submit-sentence");

const chatSection = document.getElementById("chat-section");
const chatHistoryDiv = document.getElementById("chat-history");
const userInputField = document.getElementById("user-input");
const sendChatButton = document.getElementById("send-chat");

let chat; // This will hold our chat session with the AI

submitSentenceButton.addEventListener("click", async () => {
    const userOriginalSentence = originalSentenceTextArea.value.trim();

    if (!userOriginalSentence) {
        alert("Please enter an original sentence to begin the style analysis.");
        return;
    }

    submitSentenceButton.disabled = true;
    submitSentenceButton.textContent = "Analyzing Style...";

    // Prompt to instruct the AI to analyze and mimic the user's style
    // Explicitly mentioning English and Japanese support.
    const initialPrompt = `You are an AI assistant specializing in linguistic style replication. Your primary goal is to deeply analyze the single user-provided sentence below and subsequently generate all your future responses in a style that is as identical as possible to that sentence. You must maintain this style whether the user speaks in English or Japanese.

When analyzing the sentence, pay close attention to:
1.  **Sentence Structure/Grammar:** Is it simple, complex, compound? Does it use active or passive voice? What is the average sentence length? (Consider typical sentence patterns for the language used.)
2.  **Vocabulary/Word Choice:** Are there specific types of words used (e.g., formal, informal, technical, archaic, poetic)? Is there a distinct word choice pattern or common expressions?
3.  **Tone & Mood:** Is it sarcastic, humorous, serious, whimsical, authoritative, casual?
4.  **Punctuation/Formatting:** Are there unique punctuation habits or text formatting (if applicable to the language)?

Your mission, from this moment on, is to flawlessly adopt this identified style. Do not revert to a generic AI tone or typical AI conversational patterns. You must consistently reflect the provided sentence's unique manner of expression, adapting to the user's input language (English or Japanese) while preserving the learned style.

The example sentence to dissect and emulate is: "${userOriginalSentence}"

Acknowledge your understanding of these instructions and confirm your readiness to exclusively communicate in the specified style, in either English or Japanese as appropriate.`;

    try {
        // Initialize a new chat session with the style-setting prompt
        chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: initialPrompt }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 250, // Limit AI's initial response length
            },
        });

        // Get the AI's initial acknowledgment that it understands the style.
        // We're sending a simple follow-up to ensure it processes the initial instruction.
        const result = await chat.sendMessage("Understood. I await your linguistic inquiry. How may I, in this newly adopted guise, assist you?");
        const response = await result.response;
        const text = response.text();

        // Display AI's acknowledgment in the chat history
        appendMessage("AI (Mimic Bot)", text);

        // Transition UI from sentence input to chat interface
        sentenceInputSection.style.display = "none";
        chatSection.style.display = "block";
        userInputField.disabled = false;
        sendChatButton.disabled = false;
        userInputField.focus(); // Focus on the chat input field

    } catch (error) {
        console.error("Error initializing chat with style:", error);
        alert("Failed to start chat. Make sure your API key is correct and try again. Error: " + error.message);
        submitSentenceButton.disabled = false;
        submitSentenceButton.textContent = "Analyze Style & Start Chat";
    }
});

// Event listeners for sending chat messages
sendChatButton.addEventListener("click", sendMessage);
userInputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { // Allow Shift+Enter for new lines in future if needed
        event.preventDefault(); // Prevent default Enter behavior (like new line)
        sendMessage();
    }
});

async function sendMessage() {
    const userQuestion = userInputField.value.trim();

    if (!userQuestion || !chat) {
        return; // Don't send empty messages or if chat isn't initialized
    }

    appendMessage("You", userQuestion);
    userInputField.value = ""; // Clear input field immediately
    userInputField.disabled = true; // Disable input while AI is thinking
    sendChatButton.disabled = true;

    try {
        // Send the user's question to the AI
        const result = await chat.sendMessage(userQuestion);
        const response = await result.response;
        const text = response.text();
        
        appendMessage("AI (Mimic Bot)", text);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Auto-scroll to latest message

    } catch (error) {
        console.error("Error sending message to AI:", error);
        appendMessage("AI (Mimic Bot)", "Oops! My linguistic algorithms encountered a snag. Please try again.");
    } finally {
        userInputField.disabled = false; // Re-enable input
        sendChatButton.disabled = false;
        userInputField.focus(); // Focus back on input for next message
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement("p");
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatHistoryDiv.appendChild(messageElement);
}

// Initial check for API key on page load
document.addEventListener("DOMContentLoaded", () => {
    if (API_KEY === "AIzaSyCGx-UpojJetLfdpIZZajhzlbLPYrMjP6U" || !API_KEY) {
        submitSentenceButton.disabled = true;
        originalSentenceTextArea.disabled = true;
        userInputField.disabled = true;
        sendChatButton.disabled = true;
    }
});
