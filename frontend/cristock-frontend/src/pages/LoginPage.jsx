import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/market';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-cse-surface rounded-2xl p-8 border border-white/5">
        

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF87 0%, #00C9FF 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8.5 16a5 5 0 0 1-2.5-6.5"/>
              <path d="M15.5 16a5 5 0 0 0 2.5-6.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-sans">CriStock</h1>
          <p className="text-white/40 text-sm mt-1">Cricket Stock Exchange</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-cse-green focus:outline-none transition-colors"
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-cse-green focus:outline-none transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-cse-red text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-cse-green text-black font-semibold rounded-lg py-3 mt-4 hover:bg-[#00E87A] active:scale-[0.98] transition-all"
          >
            Login to Trade
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Don't have an account? <Link to="/register" className="text-cse-green hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}