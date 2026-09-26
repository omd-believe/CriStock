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

    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050508]">
      
      <div className="w-full max-w-md bg-[#12121A] rounded-2xl p-8 border border-white/10 shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
    
          <div className="w-14 h-14 rounded-full mb-4 flex items-center justify-center bg-gradient-to-br from-[#00FF87] to-[#00C9FF] text-black font-bold text-xl shadow-[0_0_15px_rgba(0,255,135,0.3)]">
            OMD
          </div>
          <h1 className="text-2xl font-bold font-sans text-white">CriStock</h1>
          <p className="text-gray-400 text-sm mt-1">Cricket Stock Exchange</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
             
              className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors"
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-[#FF4757] text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#00FF87] text-black font-bold rounded-lg py-3 mt-4 hover:bg-[#00E87A] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,255,135,0.2)] hover:shadow-[0_6px_20px_rgba(0,255,135,0.3)]"
          >
            Login to Trade
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-[#00FF87] hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}