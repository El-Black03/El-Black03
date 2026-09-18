const messagesEl = document.querySelector('#messages');
const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const mic = document.querySelector('#micBtn');
const avatar = document.querySelector('#avatar');
const speakToggle = document.querySelector('#speakToggle');
const clearBtn = document.querySelector('#clearBtn');
let history = [];

function addMessage(text, who, temporary = false) {
  const el = document.createElement('div');
  el.className = `bubble ${who}${temporary ? ' typing' : ''}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function say(text) {
  if (!speakToggle.checked || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

function welcome() {
  addMessage('Hola. Soy tu compañero local. Puedes escribirme o hablar conmigo. ¿Qué te gustaría conversar?', 'bot');
}

welcome();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage(text, 'me');
  history.push({ role: 'user', content: text });

  const loading = addMessage('Estoy pensando...', 'bot', true);
  avatar.classList.add('talking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();
    loading.remove();

    const reply = data.reply || data.error || 'No pude responder ahora.';
    addMessage(reply, 'bot');
    history.push({ role: 'assistant', content: reply });
    say(reply);
  } catch (error) {
    loading.remove();
    const reply = 'No pude conectar con el servidor local. Comprueba que ejecutaste server.py.';
    addMessage(reply, 'bot');
    say(reply);
  }

  avatar.classList.remove('talking');
});

clearBtn.addEventListener('click', () => {
  history = [];
  messagesEl.innerHTML = '';
  welcome();
  speechSynthesis?.cancel();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;

  recognition.onstart = () => {
    mic.classList.add('listening');
    mic.textContent = '⏹️';
    avatar.classList.add('listening');
  };

  recognition.onend = () => {
    mic.classList.remove('listening');
    mic.textContent = '🎙️';
    avatar.classList.remove('listening');
  };

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };

  mic.addEventListener('click', () => {
    try {
      recognition.start();
    } catch {
      recognition.stop();
    }
  });
} else {
  mic.disabled = true;
  mic.title = 'Tu navegador no admite reconocimiento de voz';
}
