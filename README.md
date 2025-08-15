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

## API Endpoints

The application uses the following API endpoints:

* **`/api/chat`** - Main chat endpoint for streaming AI responses
  * **POST** with `{ message: string, stream: boolean }`
  * Returns Server-Sent Events (SSE) stream with `chunk`, `complete`, and `error` events
  * Supports both streaming (`stream: true`) and block responses (`stream: false`)

* **`/api/mock-chat`** - Development/testing endpoint for mock responses
  * Used during development when backend is not available
  * Simulates streaming behavior for UI testing

* **`/api/health`** - Health check endpoint for monitoring

---

## Tech Stack & Architecture

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

## Component Architecture

### Frontend Component Breakdown

* **HomePage** → Landing page with prompt cards and global chat input
* **ChatPage** → Main chat interface with message history and streaming
* **MessageList** → Container for chat messages with auto-scroll
* **ChatMessage** → Individual message display with streaming animation
* **ChatInput** → Message input with auto-resize and stop functionality
* **TypingIndicator** → Animated dots during message generation
* **Card** → Reusable prompt card component
* **useChatClient** → Chat state management and API communication
* **useSSEStream** → Server-Sent Events streaming logic
* **Toast/Theme providers** → Global state and UI feedback
* **apiClient** → HTTP client for API communication

---

## Streaming Sequence Flow

### From Send to Complete (7 steps max)

1. **Send** → User submits message via ChatInput
2. **POST** → `{message, stream:true}` sent to `/api/chat`
3. **SSE Start** → Server sends `event: start` with `{"type":"start"}`
4. **SSE Chunks** → Server streams `event: chunk` with `{"type":"chunk", "content":"..."}`
5. **UI Updates** → Frontend parses chunks and updates message content in real-time
6. **SSE Complete** → Server sends `event: complete` with `{"type":"complete"}`
7. **Stop/Abort** → User can interrupt at any time, triggering `AbortController.abort()`

---

## State Machine for Send/Stop

### States and Transitions

```
States: idle → streaming → idle

Transitions:
- Send: idle → streaming (guard: !isLoading)
- Complete: streaming → idle (guard: response finished)
- Abort: streaming → idle (guard: user clicked stop)
- Error: streaming → idle (guard: network/API error)

Guards:
- No send while streaming: isLoading check prevents multiple requests
- Stop only while streaming: stop button only visible during active generation
```

---

## Future Roadmap & Potential

The current application serves as a powerful and complete proof-of-concept. The architecture was intentionally designed to be scalable, paving the way for several high-impact future enhancements.

* **Full Chat History & Persistence:** The visual foundation for a chat history sidebar has been mocked up. The next major step would be to connect this to a database (e.g., Vercel KV or a managed Postgres) to implement full, persistent user sessions.
* **True Multi-Agent Architecture:** The backend was designed to support multiple specialized agents. The current UI simulates this by pre-filling prompts, but a future version could pass a specific `agentId` to the backend. This would unlock highly specialized and powerful conversational experiences (e.g., a dedicated "Code Review Agent" or "Document Summarization Agent").
* **Advanced Error Insight:** While robust error handling is in place, it could be enhanced to provide more specific feedback to the user based on different error codes from the backend.
* **Smooth Page Transitions:** Implement library-driven animations (e.g., using Framer Motion) to create even smoother and more visually appealing transitions between the home and chat pages.

---

## Known Issues & Limitations

* **Bot Behavior Formatting:** Message formatting and standardization can only be fully optimized once we have access to the Bedrock Agent's backend prompt/config. While message wrapping is implemented, it won't guarantee perfect adherence to formatting standards.
* **Animation Performance:** On lower-end devices, the typing animations may experience slight performance issues during rapid streaming.
* **Mobile Keyboard Handling:** Some mobile browsers may have inconsistent behavior with the viewport adjustments during keyboard interactions.

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

### Environment Configuration

* **Development:** Uses mock API endpoints for testing
* **Production:** Configure backend API endpoints in environment variables
* **Streaming:** Ensure backend supports Server-Sent Events (SSE) format