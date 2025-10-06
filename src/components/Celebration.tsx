import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PartyPopper } from 'lucide-react';

interface CelebrationProps {
  onClose: () => void;
  soundEnabled: boolean;
}

export default function Celebration({ onClose, soundEnabled }: CelebrationProps) {
  useEffect(() => {
    // Confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Optional sound (using Web Audio API for a simple celebratory tone)
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }

    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose, soundEnabled]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-labelledby="celebration-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 animate-bounce-slow">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4">
            <PartyPopper size={40} className="text-white" aria-hidden="true" />
          </div>
          <h2 id="celebration-title" className="text-3xl font-bold text-gray-900 mb-2">
            Goal Met! 🎉
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Great teamwork! You've reached your daily water goal together!
          </p>
          <div className="inline-flex items-center gap-3 text-6xl">
            <span role="img" aria-label="High five">
              🙌
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Tap anywhere to close
          </p>
        </div>
      </div>
    </div>
  );
}
