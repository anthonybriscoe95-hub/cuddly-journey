import { useState } from 'react';
import { ArrowLeft, ClipboardList, MessageCircleQuestion, Wand2, ScanLine, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';

type Msg = { role: 'coach' | 'user'; text: string };

const quickActions = [
  {
    icon: ClipboardList,
    title: 'Personalized Plan',
    body: 'Get a custom plan based on your goals.',
    seed: 'Build me a personalized plan for the next 4 weeks.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Ask AI Coach',
    body: 'Get answers to your fitness and nutrition questions.',
    seed: 'How much protein should I eat per day?',
  },
  {
    icon: Wand2,
    title: 'Workout Generator',
    body: 'Generate a workout based on your preferences.',
    seed: 'Generate a 20 minute upper body workout with dumbbells.',
  },
  {
    icon: ScanLine,
    title: 'Form Check',
    body: 'Get tips to improve your workout form.',
    seed: 'How do I improve my squat form?',
  },
];

export default function AICoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'coach',
      text: "Hi Alex! 👋 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'coach', text: respond(text) }]);
    setInput('');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg">
      <StatusBar />
      <header className="px-6 pt-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full grid place-items-center bg-bg-soft" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-bold text-lg">AI Coach</h1>
        <span className="w-10 h-10" />
      </header>

      <section className="flex-1 px-6 pt-4 pb-4 overflow-y-auto">
        <ul className="space-y-3">
          {messages.map((m, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse text-right' : ''}`}
            >
              {m.role === 'coach' && (
                <div className="w-9 h-9 rounded-full bg-brand/20 grid place-items-center text-brand-glow font-bold shrink-0">
                  AI
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm max-w-[78%] ${
                  m.role === 'user' ? 'bg-brand text-white' : 'bg-bg-card ring-1 ring-white/5'
                }`}
              >
                {m.text}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-1 gap-2">
          {quickActions.map(({ icon: Icon, title, body, seed }) => (
            <button
              key={title}
              onClick={() => send(seed)}
              className="flex items-center gap-3 p-3 rounded-2xl bg-bg-card ring-1 ring-white/5 text-left"
            >
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-brand/15 text-brand-glow">
                <Icon size={18} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-sm">{title}</span>
                <span className="block text-white/55 text-[12px]">{body}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="px-6 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 bg-bg-card ring-1 ring-white/5 rounded-2xl px-4 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent outline-none text-sm placeholder-white/40 py-2"
          />
          <button type="submit" className="w-9 h-9 rounded-full bg-brand grid place-items-center" aria-label="Send">
            <Send size={16} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

function respond(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('protein')) {
    return 'A common starting point is 0.7–1g of protein per pound of bodyweight per day. Spread it across 3–5 meals for best absorption.';
  }
  if (t.includes('squat')) {
    return 'Keep your chest up, brace your core, and drive your knees out over your toes. Pause briefly at the bottom to control depth.';
  }
  if (t.includes('plan')) {
    return "Got it — I'll draft a 4-week plan with 4 sessions/week mixing strength and HIIT. Want me to focus on fat loss or muscle gain?";
  }
  if (t.includes('upper body') || t.includes('dumbbell')) {
    return '20-min Upper Body: Push Press 3×8, DB Row 3×10, Incline Press 3×10, Lateral Raise 3×12, Curls 3×12. Rest 45–60s.';
  }
  return "Great question! I can help with plans, form, and nutrition. Tell me your goal and I'll tailor a recommendation.";
}
