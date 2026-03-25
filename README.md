# Lumi - AI Mental Health Companion 
<img width="1917" height="865" alt="image" src="https://github.com/user-attachments/assets/e101e965-ccff-4f10-8b2c-a2ccdc0c5cca" />

Lumi is a compassionate, immersive 3D AI companion designed to provide a safe space for emotional support, mindfulness, and gentle conversation. Combining state-of-the-art AI with interactive 3D avatars, Lumi offers a unique and calming interaction experience.

## 🌟 Features

- **Empathetic AI**: Powered by Llama 3.3 (70B) via Groq Cloud, Lumi is trained to listen, support, and provide mindfulness advice.
- **Interactive 3D Avatar**: A lifelike avatar (ReadyPlayerMe) that reacts to your emotions, speaks, and even dances to cheer you up.
- **Voice Interaction**: Seamless Text-to-Speech (TTS) powered by Deepgram Aura for natural-sounding responses.
- **Calm Atmosphere**: Immersive background music and soothing Vanta.js waves to create a tranquil environment.
- **Crisis Support**: Designed with safety in mind, providing gentle reminders and professional resources when needed.

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, Babylon.js (3D Rendering), Three.js (Background Effects).
- **Backend**: Node.js, Express.
- **AI/ML**: Groq SDK (LLM), Deepgram API (TTS).
- **Assets**: Ready Player Me (Avatar & Animations).

## 🛠️ Getting Started

### Prerequisites

- Node.js installed.
- API Keys for [Groq](https://console.groq.com/) and [Deepgram](https://console.deepgram.com/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Lumi-AI-Mental-Health-Companion.git
   cd Lumi-AI-Mental-Health-Companion
   ```

2. Install dependencies for both server and public:
   ```bash
   cd server
   npm install
   cd ../public
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `server` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   DEEPGRAM_API_KEY=your_deepgram_api_key
   ```

4. Run the backend server:
   ```bash
   cd server
   node server.js
   ```

5. Open `public/index.html` in a server (e.g., using the **Live Server** VS Code extension or a similar tool) to access the frontend and ensure optimal performance.

## 📜 Attributions & Acknowledgments

### Assets
- **Music & SFX**: Royalty-free assets from [Pixabay](https://pixabay.com/) and [Bensound](https://www.bensound.com/).
- **3D Models**: Avatars created using [Ready Player Me](https://readyplayer.me/).
- **Animations**: Powered by the [Ready Player Me Animation Library](https://github.com/readyplayerme/animation-library).

### References
- This project uses [readyplayer-talk](https://github.com/crazyramirez/readyplayer-talk) by crazyramirez as a primary reference for the 3D talking avatar implementation.

## ⚖️ License

This project and its assets are intended for **non-commercial use only**. All media assets are used under **Creative Commons Attribution-NonCommercial (CC BY-NC)** or their respective royalty-free licenses.

---
*Created with ❤️ by Bahasuru Nayanakantha*
