/**
 * REICHSHOF HAMBURG - VOICE ASSISTANT + WAVEFORM VISUALIZER
 * Version: 3.0.5
 * Integracija s postojećim Digital Concierge sustavom
 */

class ReichshofVoiceAssistant {
    constructor() {
        this.audioAssets = {
            system: {
                micStart: 'https://raw.githubusercontent.com/zeljkobratic69-techBajteBrate/audio-uploader/main/0000a7dc.mp3',
                micStop: 'https://raw.githubusercontent.com/zeljkobratic69-techBajteBrate/audio-uploader/main/0000a7dd.mp3',
                error: 'https://raw.githubusercontent.com/zeljkobratic69-techBajteBrate/audio-uploader/main/0000a7de.mp3',
                success: 'https://raw.githubusercontent.com/zeljkobratic69-techBajteBrate/audio-uploader/main/0000b054.mp3'
            }
        };
        
        this.lang = 'de-DE';
        this.isListening = false;
        this.isProcessing = false;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.timeData = null;
        this.phase = 0;
        this.lastResponse = '';
        this.recognition = null;
        
        // Referenca na postojeći roomDatabase
        this.roomDatabase = window.roomDatabase || {};
        
        // Inicijalizacija pri prvom pozivu
        this.initialized = false;
    }

    /**
     * Inicijalizacija - kreira DOM elemente
     */
    init() {
        if (this.initialized) return;
        
        this.createMicIndicator();
        this.createResponsePanel();
        this.injectStyles();
        
        this.initialized = true;
        console.log('🎙️ Reichshof Voice Assistant initialized');
    }

    /**
     * Kreira vizualni indikator za mikrofon s waveform-om
     */
    createMicIndicator() {
        // Provjeri postoji li već
        if (document.getElementById('mic-indicator')) return;
        
        this.micContainer = document.createElement('div');
        this.micContainer.id = 'mic-indicator';
        this.micContainer.innerHTML = `
            <div class="visualizer-container">
                <canvas id="audio-visualizer"></canvas>
            </div>
            <div class="mic-pulse">
                <div class="mic-icon">
                    <i class="fas fa-microphone"></i>
                </div>
            </div>
            <div class="mic-text">Ich höre zu...</div>
            <div class="interim-text"></div>
        `;
        
        document.body.appendChild(this.micContainer);
        
        // Postavi canvas
        this.canvas = document.getElementById('audio-visualizer');
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Retina display podrška
        const dpr = window.devicePixelRatio || 1;
        const rect = this.micContainer.querySelector('.visualizer-container').getBoundingClientRect();
        this.canvas.width = 320 * dpr;
        this.canvas.height = 120 * dpr;
        this.canvas.style.width = '320px';
        this.canvas.style.height = '120px';
        this.canvasCtx.scale(dpr, dpr);
    }

    /**
     * Kreira panel za prikaz odgovora
     */
    createResponsePanel() {
        if (document.getElementById('voice-response')) return;
        
        const panel = document.createElement('div');
        panel.id = 'voice-response';
        panel.className = 'voice-response';
        panel.innerHTML = `
            <h3><i class="fas fa-robot" style="color: #fbbf24; margin-right: 10px;"></i>Reichshof Assistant</h3>
            <p id="voice-response-text"></p>
            <div style="margin-top: 20px;">
                <button class="voice-btn-repeat" onclick="reichshofAssistant.speakResponse()">
                    <i class="fas fa-volume-up"></i> Wiederholen
                </button>
                <button class="voice-btn-close" onclick="reichshofAssistant.hideResponse()">
                    <i class="fas fa-times"></i> Schließen
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.responsePanel = panel;
        this.responseText = document.getElementById('voice-response-text');
    }

    /**
     * Inject CSS stilova
     */
    injectStyles() {
        if (document.getElementById('reichshof-voice-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'reichshof-voice-styles';
        style.textContent = `
            /* ============================================
               REICHSHOF VOICE ASSISTANT STYLES
               ============================================ */
            
            #mic-indicator {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: none;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                z-index: 99999;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 50px 70px;
                border-radius: 24px;
                box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(251, 191, 36, 0.3);
                border: 2px solid rgba(251, 191, 36, 0.4);
                backdrop-filter: blur(20px);
            }
            
            #mic-indicator.active {
                display: flex;
                animation: micFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes micFadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            
            /* WAVEFORM CONTAINER */
            .visualizer-container {
                width: 320px;
                height: 120px;
                position: relative;
                margin-bottom: 15px;
                background: radial-gradient(ellipse at center, rgba(251, 191, 36, 0.08) 0%, transparent 70%);
                border-radius: 16px;
                overflow: hidden;
            }
            
            #audio-visualizer {
                width: 100%;
                height: 100%;
                border-radius: 16px;
            }
            
            /* MIC PULSE - Reichshof Gold Style */
            .mic-pulse {
                width: 100px;
                height: 100px;
                background: linear-gradient(135deg, #fbbf24, #d97706);
                border-radius: 50%;
                position: relative;
                animation: micPulse 2s ease-in-out infinite;
                box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5);
            }
            
            @keyframes micPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5); }
                50% { transform: scale(1.08); box-shadow: 0 15px 50px rgba(251, 191, 36, 0.7); }
            }
            
            .mic-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 44px;
                color: #0f172a;
            }
            
            /* SOUND WAVES */
            .mic-pulse::before,
            .mic-pulse::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 3px solid #fbbf24;
                border-radius: 50%;
                opacity: 0;
            }
            
            .mic-pulse::before {
                width: 160px;
                height: 160px;
                animation: soundWave 2.5s ease-out infinite;
            }
            
            .mic-pulse::after {
                width: 220px;
                height: 220px;
                animation: soundWave 2.5s ease-out 0.8s infinite;
            }
            
            @keyframes soundWave {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; }
                100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
            }
            
            /* TEXT STYLES */
            .mic-text {
                color: #fbbf24;
                font-size: 22px;
                font-weight: 600;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin-top: 15px;
                text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
            }
            
            .interim-text {
                color: #94a3b8;
                font-size: 16px;
                min-height: 24px;
                font-style: italic;
                max-width: 300px;
                text-align: center;
                transition: all 0.3s ease;
                margin-top: 10px;
            }
            
            /* Processing State */
            .mic-processing .mic-pulse {
                animation: none;
                background: linear-gradient(135deg, #22c55e, #16a34a);
            }
            
            .mic-processing .mic-text {
                color: #22c55e;
            }
            
            /* Error State */
            .mic-error .mic-pulse {
                animation: shake 0.5s ease-in-out;
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            .mic-error .mic-text {
                color: #ef4444;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            
            /* Enhanced Voice Button */
            .voice-btn {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fbbf24, #d97706);
                border: none;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(251, 191, 36, 0.4);
                z-index: 10000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .voice-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 12px 40px rgba(251, 191, 36, 0.6);
            }
            
            .voice-btn:active {
                transform: scale(0.95);
            }
            
            .voice-btn.listening {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                animation: voiceBtnPulse 1.5s ease-in-out infinite;
            }
            
            @keyframes voiceBtnPulse {
                0%, 100% { box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4); }
                50% { box-shadow: 0 12px 40px rgba(239, 68, 68, 0.7); }
            }
            
            .voice-btn i {
                font-size: 28px;
                color: #0f172a;
            }
            
            /* Voice Response Panel */
            .voice-response {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #0f172a, #1e293b);
                border: 2px solid #fbbf24;
                border-radius: 20px;
                padding: 30px 40px;
                max-width: 500px;
                text-align: center;
                z-index: 99998;
                box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                display: none;
            }
            
            .voice-response.active {
                display: block;
                animation: responseFadeIn 0.4s ease;
            }
            
            @keyframes responseFadeIn {
                from { opacity: 0; transform: translate(-50%, -45%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            
            .voice-response h3 {
                color: #fbbf24;
                margin-bottom: 15px;
                font-size: 1.5rem;
            }
            
            .voice-response p {
                color: #e2e8f0;
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            
            .voice-btn-repeat, .voice-btn-close {
                padding: 10px 20px;
                margin: 5px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .voice-btn-repeat {
                background: #fbbf24;
                color: #0f172a;
            }
            
            .voice-btn-repeat:hover {
                background: #f59e0b;
            }
            
            .voice-btn-close {
                background: rgba(255,255,255,0.1);
                color: #e2e8f0;
            }
            
            .voice-btn-close:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Toggle - start/stop slušanje
     */
    async toggle() {
        if (!this.initialized) this.init();
        
        if (this.isListening) {
            this.stop();
        } else {
            await this.start();
        }
    }

    /**
     * Zaustavi slušanje
     */
    stop() {
        this.isListening = false;
        this.hideMicIndicator();
        this.updateButtonState();
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch(e) {}
        }
        
        this.playSystemSound('micStop');
    }

    /**
     * Ažuriraj stanje gumba
     */
    updateButtonState() {
        const btn = document.getElementById('voice-btn');
        const icon = document.getElementById('mic-icon');
        
        if (!btn) return;
        
        if (this.isListening) {
            btn.classList.add('listening');
            btn.setAttribute('aria-pressed', 'true');
            if (icon) icon.className = 'fas fa-stop';
        } else {
            btn.classList.remove('listening');
            btn.setAttribute('aria-pressed', 'false');
            if (icon) icon.className = 'fas fa-microphone';
        }
    }

    /**
     * Inicijalizacija audio konteksta za vizualizaciju
     */
    async initAudioContext(stream) {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.analyser.fftSize = 2048;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);
            
            this.startWaveform();
        } catch (e) {
            console.warn('Audio context init failed:', e);
            // Nastavi bez vizualizacije
        }
    }

    /**
     * Pokreće waveform animaciju
     */
    startWaveform() {
        if (!this.canvasCtx) return;
        
        const ctx = this.canvasCtx;
        const width = 320;
        const height = 120;
        const centerY = height / 2;
        
        const draw = () => {
            if (!this.isListening) return;
            
            this.animationId = requestAnimationFrame(draw);
            
            if (this.analyser && this.timeData) {
                this.analyser.getByteTimeDomainData(this.timeData);
            }
            
            // Fade efekt
            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
            ctx.fillRect(0, 0, width, height);
            
            // Postavi stil
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Zlatni gradijent
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
            gradient.addColorStop(0.5, '#fbbf24');
            gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
            ctx.strokeStyle = gradient;
            
            // Glow
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Nacrtaj waveform
            ctx.beginPath();
            
            const dataLength = this.timeData ? this.timeData.length : 100;
            const sliceWidth = width / dataLength;
            let x = 0;
            
            this.phase += 0.05;
            
            for (let i = 0; i < dataLength; i++) {
                let v = 0;
                if (this.timeData) {
                    v = (this.timeData[i] - 128) / 128;
                } else {
                    v = Math.sin(this.phase + i * 0.1) * 0.3;
                }
                
                const liveFactor = 1 + Math.sin(this.phase + i * 0.01) * 0.15;
                const amplitude = v * height * 0.35 * liveFactor;
                const y = centerY + amplitude;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = x - sliceWidth;
                    let prevV = 0;
                    if (this.timeData) {
                        prevV = (this.timeData[i-1] - 128) / 128;
                    } else {
                        prevV = Math.sin(this.phase + (i-1) * 0.1) * 0.3;
                    }
                    const prevY = centerY + (prevV * height * 0.35);
                    const cpX = (prevX + x) / 2;
                    const cpY = (prevY + y) / 2;
                    ctx.quadraticCurveTo(cpX, cpY, x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            // Mirror efekt
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
            ctx.lineWidth = 2;
            
            x = 0;
            for (let i = 0; i < dataLength; i++) {
                let v = 0;
                if (this.timeData) {
                    v = (this.timeData[i] - 128) / 128;
                } else {
                    v = Math.sin(this.phase + i * 0.1) * 0.3;
                }
                
                const amplitude = v * height * 0.2;
                const y = centerY - amplitude + 15;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            
            // Centralna linija
            let average = 128;
            if (this.timeData) {
                average = Array.from(this.timeData).reduce((a, b) => a + b, 0) / this.timeData.length;
            }
            const intensity = Math.abs(average - 128) / 128;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + intensity * 0.4})`;
            ctx.lineWidth = 2;
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();
        };
        
        draw();
    }

    /**
     * Zaustavi vizualizaciju
     */
    stopVisualizer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.canvasCtx) {
            this.canvasCtx.clearRect(0, 0, 320, 120);
        }
        
        if (this.audioContext) {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
        }
        
        this.phase = 0;
    }

    /**
     * Prikaži indikator
     */
    showMicIndicator(text = 'Ich höre zu...') {
        if (!this.micContainer) return;
        
        this.micContainer.querySelector('.mic-text').textContent = text;
        this.micContainer.classList.remove('mic-processing', 'mic-error');
        this.micContainer.classList.add('active');
    }

    /**
     * Prikaži stanje obrade
     */
    showProcessing() {
        if (!this.micContainer) return;
        
        this.micContainer.classList.add('mic-processing');
        this.micContainer.querySelector('.mic-text').textContent = 'Verarbeite...';
    }

    /**
     * Prikaži grešku
     */
    showError() {
        if (!this.micContainer) return;
        
        this.micContainer.classList.add('mic-error');
        this.micContainer.querySelector('.mic-text').textContent = 'Fehler';
        setTimeout(() => this.hideMicIndicator(), 2000);
    }

    /**
     * Sakrij indikator
     */
    hideMicIndicator() {
        this.stopVisualizer();
        if (this.micContainer) {
            this.micContainer.classList.remove('active', 'mic-processing', 'mic-error');
            const interim = this.micContainer.querySelector('.interim-text');
            if (interim) interim.textContent = '';
        }
    }

    /**
     * Reproduciraj sistemski zvuk
     */
    playSystemSound(type) {
        const audio = new Audio(this.audioAssets.system[type]);
        audio.volume = 0.6;
        return audio.play().catch(e => {
            console.log('Audio play failed:', e);
            return Promise.resolve();
        });
    }

    /**
     * Text-to-Speech
     */
    speak(text, lang = this.lang) {
        return new Promise((resolve) => {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            // Pronađi najbolji glas
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => 
                (v.lang === lang && v.name.includes('Google')) || 
                (v.lang === lang && v.name.includes('Premium')) ||
                (v.lang === lang && v.name.includes('Hans')) ||
                v.lang === lang
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            
            speechSynthesis.speak(utterance);
        });
    }

    /**
     * Slušaj korisnika
     */
    async listen() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        return new Promise((resolve, reject) => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                stream.getTracks().forEach(track => track.stop());
                reject('Speech recognition not supported');
                return;
            }
            
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.lang;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            this.recognition.continuous = false;
            
            this.initAudioContext(stream);
            
            let finalTranscript = '';
            
            this.recognition.onresult = (event) => {
                const results = event.results;
                const last = results[results.length - 1];
                
                if (last.isFinal) {
                    finalTranscript = last[0].transcript;
                } else {
                    const interim = last[0].transcript;
                    const interimEl = this.micContainer.querySelector('.interim-text');
                    if (interimEl) interimEl.textContent = `"${interim}"`;
                }
            };
            
            this.recognition.onerror = (event) => {
                stream.getTracks().forEach(track => track.stop());
                reject(event.error);
            };
            
            this.recognition.onend = () => {
                stream.getTracks().forEach(track => track.stop());
                if (finalTranscript) {
                    resolve(finalTranscript);
                } else {
                    reject('No speech detected');
                }
            };
            
            this.recognition.start();
        });
    }

    /**
     * Glavna funkcija - pokreće cijeli proces
     */
    async start() {
        try {
            this.isListening = true;
            this.updateButtonState();
            
            await this.playSystemSound('micStart');
            this.showMicIndicator('Ich höre zu...');
            
            await new Promise(r => setTimeout(r, 500));
            
            const userText = await this.listen();
            console.log("👂 Erkannt:", userText);
            
            this.showProcessing();
            await this.playSystemSound('micStop');
            
            const response = await this.processCommand(userText);
            this.lastResponse = response;
            
            this.showResponse(response);
            await this.speak(response);
            await this.playSystemSound('success');
            
        } catch (error) {
            console.error("❌ Fehler:", error);
            this.showError();
            await this.playSystemSound('error');
            
            const errorMsg = "Entschuldigung, ich habe Sie nicht verstanden. Bitte versuchen Sie es erneut.";
            this.showResponse(errorMsg);
            await this.speak(errorMsg);
        } finally {
            this.isListening = false;
            this.updateButtonState();
            this.hideMicIndicator();
        }
    }

    /**
     * Prikaži odgovor u panelu
     */
    showResponse(text) {
        if (this.responseText) {
            this.responseText.textContent = text;
        }
        if (this.responsePanel) {
            this.responsePanel.classList.add('active');
        }
        
        // Automatski zatvori nakon 8 sekundi
        setTimeout(() => {
            this.hideResponse();
        }, 8000);
    }

    /**
     * Sakrij response panel
     */
    hideResponse() {
        if (this.responsePanel) {
            this.responsePanel.classList.remove('active');
        }
    }

    /**
     * Ponovi zadnji odgovor
     */
    speakResponse() {
        if (this.lastResponse) {
            this.speak(this.lastResponse);
        }
    }

    /**
     * Procesiraj korisnikovu naredbu
     */
    async processCommand(text) {
        const lowerText = text.toLowerCase();
        
        // 1. Pretraživanje sobe
        const roomMatch = lowerText.match(/(\d{3})/) || lowerText.match(/zimmer\s+(\d{1,3})/i);
        if (roomMatch || lowerText.includes('zimmer')) {
            const roomNumber = roomMatch ? roomMatch[1] : null;
            
            if (roomNumber) {
                // Koristi postojeću funkciju ako postoji
                if (typeof window.activateVoiceNavigation === 'function') {
                    window.activateVoiceNavigation(roomNumber);
                } else if (typeof activateVoiceNavigation === 'function') {
                    activateVoiceNavigation(roomNumber);
                }
                
                return `Gerne begleite ich Sie zu Zimmer ${roomNumber}. Die Navigation wird angezeigt.`;
            } else {
                return "Welche Zimmernummer suchen Sie? Bitte nennen Sie die dreistellige Nummer.";
            }
        }
        
        // 2. Restaurant i hrana
        if (lowerText.includes('restaurant') || lowerText.includes('essen') || lowerText.includes('frühstück') || lowerText.includes('bar')) {
            if (lowerText.includes('frühstück') || lowerText.includes('breakfast')) {
                if (typeof showSection === 'function') {
                    showSection('breakfast-guide');
                }
                return "Die Frühstückszeiten sind von 6:30 bis 11:30 Uhr. Die aktuelle Auslastung sehen Sie in der Frühstücks-Ampel.";
            }
            if (lowerText.includes('bar') || lowerText.includes('1910') || lowerText.includes('tausendeinhundertzehn')) {
                if (typeof showSection === 'function') {
                    showSection('hotel-info');
                }
                return "Bar 1910 ist im Erdgeschoss. Geöffnet Dienstag bis Samstag von 18:00 bis 01:00 Uhr. Momentan Sommerpause bis 3. September.";
            }
            if (lowerText.includes('emil') || lowerText.includes('bistro') || lowerText.includes('café')) {
                if (typeof showSection === 'function') {
                    showSection('hotel-info');
                }
                return "Emil's Bistro ist in der Lobby, geöffnet täglich von 9:00 bis 24:00 Uhr.";
            }
            if (typeof showSection === 'function') {
                showSection('hotel-info');
            }
            return "Unser Stadt-Restaurant befindet sich im Erdgeschoss, direkt von der Lobby erreichbar. Möchten Sie eine Reservierung?";
        }
        
        // 3. SPA i fitness
        if (lowerText.includes('spa') || lowerText.includes('sauna') || lowerText.includes('fitness') || lowerText.includes('gym') || lowerText.includes('wellness')) {
            if (typeof showSection === 'function') {
                showSection('hotel-info');
            }
            return "Das Fitnessstudio ist 24 Stunden geöffnet. Die Sauna ist täglich von 16:00 bis 22:00 Uhr geöffnet, 10 Euro Eintritt. Zugang über den SPA-Aufzug.";
        }
        
        // 4. Notfall i sigurnost
        if (lowerText.includes('notfall') || lowerText.includes('hilfe') || lowerText.includes('krank') || lowerText.includes('arzt') || lowerText.includes('feuerwehr')) {
            if (typeof showSection === 'function') {
                showSection('emergency');
            }
            return "Im Notfall wählen Sie bitte 112. Die Rezeption erreichen Sie unter Durchwahl 156. Haustechnik 770. Der Defibrillator befindet sich am Front Office.";
        }
        
        // 5. Lift i navigacija
        if (lowerText.includes('aufzug') || lowerText.includes('lift') || lowerText.includes('fahrstuhl') || lowerText.includes('treppe')) {
            return "Der barrierefreie SPA-Aufzug ist 110 cm breit und führt zu allen Etagen. Der historische TH-Aufzug ist nur 70 cm breit. Ab dem 2. Obergeschoss benötigen Sie die Zimmerkarte.";
        }
        
        // 6. WiFi i tehničko
        if (lowerText.includes('wlan') || lowerText.includes('wifi') || lowerText.includes('internet') || lowerText.includes('passwort')) {
            return "Das WLAN-Netzwerk ist 'Reichshof Hamburg'. Das Passwort erhalten Sie an der Rezeption oder auf Ihrer Zimmerkarte.";
        }
        
        // 7. Check-in/out
        if (lowerText.includes('check') || lowerText.includes('einchecken') || lowerText.includes('auschecken') || lowerText.includes('anreise') || lowerText.includes('abreise')) {
            if (lowerText.includes('aus') || lowerText.includes('abreise')) {
                return "Check-out ist bis 11:00 Uhr. Late Check-out ist auf Anfrage möglich.";
            }
            return "Der Check-in ist ab 15:00 Uhr möglich. Früher Check-in können wir je nach Verfügbarkeit anbieten.";
        }
        
        // 8. Povijest hotela
        if (lowerText.includes('geschichte') || lowerText.includes('historie') || lowerText.includes('alt') || lowerText.includes('1910') || lowerText.includes('langer')) {
            if (typeof showSection === 'function') {
                showSection('history-poi');
            }
            return "Der Reichshof wurde 1910 erbaut. Die Gedenktafel für Anton Emil Langer finden Sie im Zwischengeschoss. Das Jubiläumsbuch erhalten Sie am Front Office.";
        }
        
        // 9. Barrierefreiheit
        if (lowerText.includes('rollstuhl') || lowerText.includes('behinderung') || lowerText.includes('barrierefrei') || lowerText.includes('behindertengerecht')) {
            if (typeof showSection === 'function') {
                showSection('accessibility');
            }
            return "Wir haben barrierefreie Zimmer 212, 218, 318, 327 und 411. Der SPA-Aufzug ist vollständig barrierefrei. Möchten Sie mehr Details zu einem bestimmten Zimmer?";
        }
        
        // 10. Housekeeping
        if (lowerText.includes('reinigung') || lowerText.includes('handtuch') || lowerText.includes('service') || lowerText.includes('housekeeping') || lowerText.includes('bett')) {
            if (typeof showSection === 'function') {
                showSection('housekeeping');
            }
            return "Housekeeping-Service können Sie über den Hausservice-Bereich anfordern. Möchten Sie frische Handtücher oder Zimmerreinigung?";
        }
        
        // 11. QR kodovi i novine
        if (lowerText.includes('qr') || lowerText.includes('code') || lowerText.includes('zeitung') || lowerText.includes('newspaper') || lowerText.includes('magazin')) {
            if (typeof showSection === 'function') {
                showSection('qr-codes');
            }
            return "QR-Codes für Zeitungen und Zimmer-Navigation finden Sie im QR-Codes Bereich. Kostenlose Zeitungen sind über sharemagazines.de verfügbar.";
        }
        
        // 12. Recepcija i osoblje
        if (lowerText.includes('rezeption') || lowerText.includes('empfang') || lowerText.includes('concierge') || lowerText.includes('personal')) {
            return "Die Rezeption ist 24 Stunden besetzt. Der Concierge befindet sich meist ganz rechts am Tresen. Für alle Insiderfragen steht Ihnen unser Team gerne zur Verfügung.";
        }
        
        // 13. Parkiranje
        if (lowerText.includes('parken') || lowerText.includes('parkplatz') || lowerText.includes('auto') || lowerText.includes('garage') || lowerText.includes('silo')) {
            return "Das historische Autosilo ist verfügbar. Besichtigung als geführte Story-Station möglich. Bitte erfragen Sie am Front Office oder bei Sales.";
        }
        
        // 14. Gepäck
        if (lowerText.includes('gepäck') || lowerText.includes('koffer') || lowerText.includes('tasche') || lowerText.includes('luggage')) {
            return "Der Gepäckraum ist nur für autorisiertes Personal und videoüberwacht. Ausgabe nur gegen Original-Ticket oder Koffernummer. Tipp: Machen Sie ein Foto von Koffer plus Ticket.";
        }
        
        // 15. Markt/Marketplace
        if (lowerText.includes('markt') || lowerText.includes('marketplace') || lowerText.includes('kühlschrank') || lowerText.includes('snack') || lowerText.includes('getränk')) {
            return "Der 24-Stunden Marketplace befindet sich in der Lobby gegenüber dem Front Office. Er bietet Getränke, Snacks und Reise-Utensilien.";
        }
        
        // Default odgovor
        return "Ich habe Sie leider nicht genau verstanden. Ich kann Ihnen helfen mit: Zimmerfindung, Restaurant-Infos, SPA-Öffnungszeiten, Notfallnummern, Barrierefreiheit, oder Housekeeping. Was benötigen Sie?";
    }
}

// ============================================
// GLOBALNA INICIJALIZACIJA
// ============================================

let reichshofAssistant;

// Inicijalizacija kada je DOM spreman
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceAssistant);
} else {
    initVoiceAssistant();
}

function initVoiceAssistant() {
    // Pričekaj da se ostali skriptovi učitaju
    setTimeout(() => {
        reichshofAssistant = new ReichshofVoiceAssistant();
        
        // Poveži s postojećim voice-navigation.js
        if (typeof window.voiceNavigation !== 'undefined') {
            console.log('✅ Integrated with existing voice-navigation.js');
        }
        
        // Override postojeće funkcije za kompatibilnost
        window.toggleVoiceAssistant = function() {
            if (reichshofAssistant) {
                reichshofAssistant.toggle();
            }
        };
        
        console.log('🎙️ Reichshof Voice Assistant ready');
    }, 100);
}

// Fallback za starije browsere
window.speakVoiceMessage = function(text) {
    if (reichshofAssistant) {
        reichshofAssistant.speak(text);
    } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        speechSynthesis.speak(utterance);
    }
};