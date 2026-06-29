import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (result.success) {
      navigate('/market', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="w-full max-w-md bg-[#12121A] rounded-2xl p-8 border border-white/5">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF87 0%, #00C9FF 100%)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8.5 16a5 5 0 0 1-2.5-6.5"/>
              <path d="M15.5 16a5 5 0 0 0 2.5-6.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">CriStock</h1>
          <p className="text-white/40 text-sm mt-1">Create your trading account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" name="name" placeholder="Full Name"
            value={formData.name} onChange={handleChange}
            className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors"
          />
          <input
            type="email" name="email" placeholder="Email address"
            value={formData.email} onChange={handleChange}
            className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} name="password" placeholder="Password"
              value={formData.password} onChange={handleChange}
              className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors pr-12"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password"
            value={formData.confirmPassword} onChange={handleChange}
            className="w-full bg-[#1A1A26] border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 focus:border-[#00FF87] focus:outline-none transition-colors"
          />
          {error && <p className="text-[#FF4757] text-sm font-medium">{error}</p>}
          <button
            type="submit" disabled={loading}
            className={`w-full bg-[#00FF87] text-black font-semibold rounded-lg py-3 mt-4 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#00E87A] active:scale-[0.98]'}`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Already have an account? <Link to="/login" className="text-[#00FF87] hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}