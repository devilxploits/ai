import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { login, register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!loginUsername || !loginPassword) {
      setLoginError("Please enter both username and password");
      return;
    }
    
    try {
      await login(loginUsername, loginPassword);
      setLocation("/");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    }
  };
  
  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError("Please fill in all fields");
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setRegisterError("Please enter a valid email address");
      return;
    }
    
    try {
      await register(registerUsername, registerEmail, registerPassword);
      setLocation("/");
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Sophia AI Companion</title>
        <meta name="description" content="Login or create an account to connect with Sophia, your personal AI companion." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-primary mb-2">Sophia</h1>
            <p className="text-light-dimmed">Your Personal AI Companion</p>
          </div>
          
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login to your account to continue</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username" 
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <a href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Input 
                          id="login-password" 
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <i className="ri-eye-off-line"></i>
                          ) : (
                            <i className="ri-eye-line"></i>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {loginError && (
                      <div className="text-sm text-red-500">{loginError}</div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Register to connect with Sophia</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        placeholder="Create a username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="Enter your email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input 
                          id="register-password" 
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? (
                            <i className="ri-eye-off-line"></i>
                          ) : (
                            <i className="ri-eye-line"></i>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input 
                          id="register-confirm-password" 
                          type={showRegisterConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                          onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        >
                          {showRegisterConfirmPassword ? (
                            <i className="ri-eye-off-line"></i>
                          ) : (
                            <i className="ri-eye-line"></i>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {registerError && (
                      <div className="text-sm text-red-500">{registerError}</div>
                    )}
                    
                    <div className="text-xs text-light-dimmed">
                      By registering, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
