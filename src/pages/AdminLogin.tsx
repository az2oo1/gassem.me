import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Invalid password");
      
      const data = await response.json();
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in p-6">
      <div className="bg-transparent p-8 rounded-sm shadow-sm border border-soft-sepia w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-muted-beige flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif text-charcoal text-center mb-2">Admin Access</h2>
        <p className="text-[10px] uppercase tracking-widest text-muted text-center mb-8">Secure Area</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-200 text-xs rounded-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-soft-sepia rounded-sm focus:outline-none focus:border-accent transition-colors bg-warm-white text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 px-4 bg-charcoal text-charcoal border border-soft-sepia text-warm-white rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
               <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
