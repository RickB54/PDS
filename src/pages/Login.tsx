import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { quickAccessLogin, login, createAccount } from "@/lib/auth";
import { Users, Briefcase, Shield } from "lucide-react";
import logo from "@/assets/logo-3inch.png";

const Login = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleQuickAccess = (role: 'employee' | 'admin') => {
    quickAccessLogin(role);
    navigate('/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check pre-set credentials
    if (email.toLowerCase() === 'admin' && password === 'Admin123') {
      quickAccessLogin('admin');
      navigate('/dashboard');
      return;
    }
    
    if (email.toLowerCase() === 'employee' && password === 'Employee123') {
      quickAccessLogin('employee');
      navigate('/dashboard');
      return;
    }
    
    // Otherwise, regular login
    const user = login(email, password);
    
    if (user.role === 'customer') {
      navigate('/customer-portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const user = createAccount(email, password, name);
    navigate('/customer-portal');
  };

  const handleGuest = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="Prime Detail Solutions" className="w-48 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground">Precision, Protection, Perfection</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleQuickAccess('employee')}
                variant="outline"
                className="flex-col h-auto py-4 gap-2"
              >
                <Briefcase className="h-6 w-6" />
                <span className="text-xs">Employee</span>
              </Button>
              <Button
                onClick={() => handleQuickAccess('admin')}
                variant="outline"
                className="flex-col h-auto py-4 gap-2"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs">Admin</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {!isCreating ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsCreating(true)}
              >
                Create New Account
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleGuest}
              >
                Continue as Guest
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsCreating(false)}
              >
                Back to Sign In
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
