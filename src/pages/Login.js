import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    institute_id: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      institute_id: 'DEMO001',
      password: 'demo123'
    });
    
    // Trigger form submission after state update
    setTimeout(() => {
      document.getElementById('login-form').requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">IIT BBS</h1>
          <p className="text-muted-foreground">Security Access System</p>
        </div>

        <Card className="bg-card border-border/40">
          <CardHeader>
            <CardTitle data-testid="login-title">Sign in</CardTitle>
            <CardDescription>Use your User ID and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institute_id">Institute ID</Label>
                <Input
                  id="institute_id"
                  data-testid="institute-id-input"
                  type="text"
                  placeholder="Enter your Institute ID"
                  value={formData.institute_id}
                  onChange={(e) => setFormData({ ...formData, institute_id: e.target.value })}
                  required
                  className="bg-secondary/50 border-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-secondary/50 border-input"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive" data-testid="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                data-testid="login-submit-button"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Button
                type="button"
                variant="outline"
                data-testid="demo-login-button"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Try Demo Login
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New here?{' '}
                <Link to="/register" className="text-primary hover:underline">Create an account</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};
