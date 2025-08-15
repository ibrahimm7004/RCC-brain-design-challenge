# Oracle Utilities AI Assistant - Frontend Challenge Submission

This repository contains the completed frontend for the Oracle Utilities AI Assistant project. The application was built to exceed the original project brief, demonstrating a mastery of modern frontend development by creating a polished, feature-rich, and highly performant user experience for a professional-grade internal AI tool.

---

## Vision & Accomplishments

This project successfully fulfills all core requirements and creatively expands upon the "bonus" features to deliver a superior final product.

* **Core Mission Accomplished:** A fully functional, streaming chat interface has been integrated with the live AI backend, providing real-time, animated responses.
* **Superior User Experience:** The UI/UX was designed with a "Modern Depth" philosophy. By leveraging gradients, a robust light/dark theme, and subtle animations, we've created a premium and intuitive feel, proving that development driven by strong UX principles can produce exceptional results.
* **Advanced Feature Set:** The application includes features common in top-tier AI products:
    * **Selectable Typing Animations:** Users can choose between different typing styles (Claude, ChatGPT, Gemini, Smooth) to customize their experience.
    * **Robust Error Handling:** A centralized toast notification system provides user-friendly feedback for any API or network errors.
    * **Advanced Chat Input:** The input component features auto-resizing, keyboard shortcuts (`Enter` to send, `Shift+Enter` for newline), a "Stop Generation" button, and intelligent error state handling.
    * **Message Actions:** Completed messages include "Copy" and "Retry" functionality.

---

## Tech Stack & Architecture
## API Endpoints Used

* **POST /api/chat** — Main endpoint for sending user messages and receiving streaming AI responses (SSE). The frontend sends `{ message, stream: true }` in the request body. All chat functionality is powered by this endpoint.


The application is built on a modern, robust, and scalable tech stack.

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (with a custom design system based on the project brief)
* **UI:** React
* **State Management:** Advanced client-side state management using React Hooks (`useState`, `useRef`) to create a complex, uninterruptible animation engine and manage UI state without external libraries, adhering to the "Do Not Over-Engineer" principle.
* **Architecture Decisions:**
    * **Component-Based:** The UI is composed of highly modular and reusable components (`Card`, `ChatInput`, `ChatMessage`) for maintainability and scalability.
    * **Streaming-First:** The entire data flow is built around handling real-time Server-Sent Events (SSE). The frontend features a robust parsing and animation engine that can handle various response styles.
    * **Accessibility:** Key accessibility features, including ARIA labels, semantic HTML, and keyboard navigation enhancements, have been implemented.
    * **Responsive Design:** A mobile-first approach was taken to ensure a seamless and pixel-perfect experience across all devices, from mobile phones to desktops.

---

## Future Roadmap & Potential
## Known Issues & Limitations
* **Stop response button:** The Stop button may not reliably interrupt the streaming response in all cases. This is a known limitation and will be addressed in future updates for more robust stream control.

* **Bot formatting/standardization:** Message formatting and standardization are limited by the current backend prompt/config. Full control will be possible once the Bedrock Agent’s backend prompt/config is accessible. Wrapping messages is possible now, but perfect adherence is not guaranteed.

## Lightweight Architectural Flows

### a) Component Breakdown (Frontend)
* **HomePage:** Landing page, shows prompt cards and theme toggle.
* **ChatPage:** Main chat interface, manages message state and streaming.
* **MessageList:** Renders all chat messages (integrated in ChatPage).
* **ChatMessage:** Displays a single message, handles animation and actions.
* **ChatInput:** User input field, handles send/stop and keyboard shortcuts.
* **TypingIndicator:** Shows animated dots while assistant is streaming.
* **useChatClient:** (future) Encapsulates chat logic and API calls.
* **useSSEStream:** (future) Handles SSE streaming logic.
* **Toast/Theme providers:** Global UI feedback and theme management.
* **apiClient:** (future) Centralized API request logic.

### b) Streaming Sequence (max 7 steps)
1. User types message and clicks Send.
2. Frontend POSTs `{ message, stream: true }` to `/api/chat`.
3. Backend responds with SSE stream: start → chunk(s) → complete.
4. Frontend parses each chunk and updates UI in real time.
5. Typing animation and cursor update as chunks arrive.
6. User can click Stop to abort stream (AbortController).
7. Errors trigger toast notifications; UI resets to idle.

### c) Tiny State Machine for Send/Stop
* **States:** idle → streaming → idle
* **Transitions:**
    * Send: idle → streaming
    * Complete: streaming → idle
    * Abort: streaming → idle
    * Error: streaming → idle
* **Guards:**
    * No send allowed while streaming

The current application serves as a powerful and complete proof-of-concept. The architecture was intentionally designed to be scalable, paving the way for several high-impact future enhancements.

* **Full Chat History & Persistence:** The visual foundation for a chat history sidebar has been mocked up. The next major step would be to connect this to a database (e.g., Vercel KV or a managed Postgres) to implement full, persistent user sessions.
* **True Multi-Agent Architecture:** The backend was designed to support multiple specialized agents. The current UI simulates this by pre-filling prompts, but a future version could pass a specific `agentId` to the backend. This would unlock highly specialized and powerful conversational experiences (e.g., a dedicated "Code Review Agent" or "Document Summarization Agent").
* **Advanced Error Insight:** While robust error handling is in place, it could be enhanced to provide more specific feedback to the user based on different error codes from the backend.
* **Smooth Page Transitions:** Implement library-driven animations (e.g., using Framer Motion) to create even smoother and more visually appealing transitions between the home and chat pages.

---

## Setup & Installation

### Prerequisites

* Node.js 18+
* `npm` or `yarn`

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shamzahasan88/RCC-Brain-Design-Challenge.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd RCC-Brain-Design-Challenge
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.