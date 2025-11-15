import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { quickAccessLogin } from "@/lib/auth";
import { Briefcase, Shield } from "lucide-react";
import logo from "@/assets/logo-3inch.png";

const Login = () => {
  const navigate = useNavigate();

  const handleQuickAccess = (role: 'employee' | 'admin') => {
    quickAccessLogin(role);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="Prime Detail Solutions" className="w-48 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground">Precision, Protection, Perfection</p>
          <div className="mt-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/">Back to Website</Link>
            </Button>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground">Choose your role to continue.</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => handleQuickAccess('employee')}
                variant="outline"
                type="button"
                className="flex-col h-auto py-4 gap-2"
              >
                <Briefcase className="h-6 w-6" />
                <span className="text-xs">Employee Login</span>
              </Button>
              <Button
                onClick={() => handleQuickAccess('admin')}
                variant="outline"
                type="button"
                className="flex-col h-auto py-4 gap-2"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs">Admin Login</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
