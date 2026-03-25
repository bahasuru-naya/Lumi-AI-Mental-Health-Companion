
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chatToggleBtn');
    const sidebar = document.getElementById('chat-sidebar');
    const sendBtn = document.getElementById('convertBtn');
    const input = document.getElementById('speaktest');
    const messages = document.getElementById('chat-messages');
    const startBtn = document.getElementById('startBtn');
    const micBtn = document.getElementById('micBtn');
    
    // Info Modal Elements
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfo = document.querySelector('.close-info');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    let isMuted = false;

    messages.style.transition = 'opacity 0.1s ease';
    messages.style.opacity = '0';

    // Ensure chat button becomes visible when start is clicked
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            toggleBtn.style.visibility = 'visible';
            const branding = document.getElementById('top-nav-branding');
            if (branding) branding.style.visibility = 'visible';
        });
    }

    // Toggle Sidebar
    toggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('chat-open')) {            
            messages.style.transition = 'opacity 0.1s ease';
            messages.style.opacity = '0';


        } else {             
            messages.style.transition = 'opacity 0.3s ease 0.3s';
            messages.style.opacity = '1';
            messages.scrollTop = messages.scrollHeight; // Scroll to bottom when opened
        }
        document.body.classList.toggle('chat-open');

        toggleBtn.textContent = document.body.classList.contains('chat-open') ? 'Close Chat Window' : 'Open Chat Window';
    });

    // Voice Recognition Logic
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isListening = false;

        micBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Recognition start failed:', e);
                    stopListening();
                }
            }
        });

        recognition.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            input.placeholder = "Listening... Speak now";
            console.log("Voice Recognition started");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript received:", transcript);
            input.value = transcript;
            input.placeholder = "Great! Processing...";
            
            // Allow a small delay to see the text before sending
            setTimeout(() => {
                sendBtn.click();
            }, 800);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access is blocked. Please enable it in your browser settings.');
            }
            stopListening();
        };

        recognition.onend = () => {
            console.log("Voice Recognition ended");
            stopListening();
        };

        function stopListening() {
            isListening = false;
            micBtn.classList.remove('listening');
            input.placeholder = "Type or speak to Lumi...";
        }
    } else {
        micBtn.style.display = 'none'; // Hide if not supported
        console.warn('Speech Recognition not supported in this browser.');
    }

    // Handle Send Message
    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {            
            addMessage(text, 'user');        
           
        } else {
            // Show formal toast message
            showToast("Please share your thoughts or provide a voice command to continue our session.");
        }
    });

    function showToast(message) {
        const existingToast = document.querySelector('.lumi-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'lumi-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastFadeOut 0.4s ease-out forwards';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }


    // Info Modal Logic
    if (infoBtn && infoModal && closeInfo) {
        infoBtn.addEventListener('click', () => {
            infoModal.style.display = 'flex';
        });

        closeInfo.addEventListener('click', () => {
            infoModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }

    // Music Toggle Logic
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', () => {
            if (typeof music !== 'undefined' && music) {
                isMuted = !isMuted;
                const icon = document.getElementById('musicIcon');
                if (isMuted) {
                    music.setVolume(0);
                    musicToggleBtn.classList.add('muted');
                    icon.innerHTML = '<path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.17l2.96 2.96L19 21l1.27-1.27L4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/>';
                } else {
                    music.setVolume(0.5);
                    musicToggleBtn.classList.remove('muted');
                    icon.innerHTML = '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';
                }
            }
        });
    }

    // Dance Button Logic
    const danceBtn = document.getElementById('danceBtn');
    if (danceBtn) {
        danceBtn.addEventListener('click', () => {
            if (typeof isDancing !== 'undefined' && isDancing) {
                if (typeof stopDance === 'function') stopDance();
            } else {
                if (typeof playDance === 'function') playDance();
            }
        });
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }


});
