import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        success = await signup(email, password);
      }

      if (!success) {
        setError(isLogin ? 'Invalid credentials. Please try again.' : 'Could not create account. The email might already be in use.');
      }
      // On success, the AuthProvider will handle redirecting by changing isAuthenticated state
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    }
  };

  const inputClass = "w-full bg-brand-light-blue border border-brand-light-blue/50 rounded-md p-3 text-white placeholder-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all";
  const labelClass = "block mb-2 text-sm font-medium text-brand-gray";

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-dark-blue p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-4 mb-6">
                 <div className="bg-brand-dark p-3 rounded-xl">
                    <svg className="h-10 w-10 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 20V4h6c3.31 0 6 2.69 6 6s-2.69 6-6 6H6" />
                        <path d="M6 12h8c3.31 0 6 2.69 6 6s-2.69 6-6 6H6v-6" />
                    </svg>
                </div>
                 <h1 className="text-5xl font-poppins font-bold text-white">BankRoLL</h1>
            </div>
            <p className="text-brand-gray">{isLogin ? 'Sign in to continue to your journal.' : 'Start tracking your trading performance.'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    className={inputClass}
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <input 
                    type="password" 
                    id="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className={inputClass}
                    required
                />
            </div>

            {error && <p className="text-sm text-brand-loss text-center">{error}</p>}

            <div>
                <button type="submit" className="w-full px-8 py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 transform hover:-translate-y-0.5">
                    {isLogin ? 'Login' : 'Sign Up'}
                </button>
            </div>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-brand-gray">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-brand-accent hover:underline focus:outline-none">
                    {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};