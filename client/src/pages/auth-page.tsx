import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import Select from "@/components/ui/select";
import { Microscope, Eye, EyeOff } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { InputField } from "@/components/ui/input-field";
import { FileUpload } from "@/components/ui/file-upload";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { user, loginMutation, registerMutation,  } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetForm, setResetForm] = useState({ username: "", password: "" });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    role: "student" as "student" | "researcher" | "technician" | "admin",
    city: "",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Reset failed");
      return res.json();
    },
    onSuccess: () => {
      setShowReset(false);
      setIsLogin(true);
    },
    onError: () => {
      // toast({
      //   title: "Reset failed",
      //   description: "Check your username and try again.",
      //   variant: "destructive",
      // });
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      ...loginForm,
      username: loginForm.username.toLowerCase(),
    });
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePic(file);
    if (file) {
      const reader = new FileReader(); //convert image to base64
      reader.onloadend = () => setProfilePicPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send JSON with optional base64 profile picture for simplicity
    registerMutation.mutate({
      ...registerForm,
      username: registerForm.username.toLowerCase(),
      profilePicture: profilePicPreview || undefined,
    } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-center space-x-3">
              <div className="p-3 bg-primary rounded-lg">
                <Microscope className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ">Mobile Bio Lab</h1>
            </div>
            <p className="text-xl text-center ">
              Advanced biological research at your fingertips
            </p>
            <p className="text-lg text-center max-w-lg">
              Join ABC Laboratories' innovative platform for remote biological
              sample analysis, data visualization, and collaborative research.
            </p>
          </div>
        </div>

        {/* Auth Forms */}

        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-center space-x-2 mb-4">
                <Button
                  variant={isLogin ? "default" : "outline"}
                  onClick={() => setIsLogin(true)}
                  className="flex-1"
                >
                  Sign In
                </Button>
                <Button
                  variant={!isLogin ? "default" : "outline"}
                  onClick={() => setIsLogin(false)}
                  className="flex-1"
                >
                  Sign Up
                </Button>
              </div>
              <CardTitle className="text-2xl text-center">
                {isLogin ? "Welcome back" : "Create account"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin
                  ? "Enter your credentials to access your lab account"
                  : "Join the Mobile Bio Lab community"}
              </CardDescription>
            </CardHeader>
            {/* login or sign in form */}
            <CardContent>
              {isLogin && !showReset && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField
                    id="login-username"
                    label="Username"
                    type="text"
                    
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    required
                  />
                  <div className="relative space-y-2">
                    <InputField
                      id="login-password"
                      label="Password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                      className="pr-10"
                    />
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={
                        showLoginPassword ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )
                      }
                      className="absolute right-0 top-[5px] h-full px-3"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                    />
                  </div>
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      type="button"
                      className="text-sm text-primary underline"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    
                  >
                    Sign In
                  </Button>
                </form>
              )}
              {/* // Reset Password Form */}
              {showReset && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    resetPasswordMutation.mutate(resetForm);
                  }}
                  className="space-y-4"
                >
                  <InputField
                    id="reset-username"
                    label="Username"
                    value={resetForm.username}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, username: e.target.value })
                    }
                    required
                  />
                  <InputField
                    id="reset-password"
                    label="New Password"
                    type="password"
                    value={resetForm.password}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, password: e.target.value })
                    }
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                     
                    >
                      Reset Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowReset(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
              {/* Registrion & sign up form  */}

              {!isLogin && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="firstName"
                      label="First Name"
                      value={registerForm.firstName}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                    <InputField
                      id="lastName"
                      label="Last Name"
                      value={registerForm.lastName}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <InputField
                    id="username"
                    label="Username"
                    value={registerForm.username}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                  <InputField
                    id="email"
                    label="Email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="relative space-y-2 ">
                    <InputField
                      id="password"
                      label="Password"
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      required
                      className="pr-10"
                    />
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={
                        showRegisterPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )
                      }
                      className="absolute top-[5px] right-0 h-full px-3"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      aria-label={
                        showRegisterPassword ? "Hide password" : "Show password"
                      }
                    />
                  </div>
                  <InputField
                    id="mobile"
                    label="Mobile"
                    type="tel"
                    value={registerForm.mobile}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        mobile: e.target.value,
                      })
                    }
                    required
                  />

                  <div className="space-y-2">
                    <label htmlFor="role">Role</label>
                    <Select
                      placeholder="Select role"
                      value={registerForm.role}
                      onChange={(value: string) =>
                        setRegisterForm({
                          ...registerForm,
                          role: value as "student" | "researcher" | "technician" | "admin",
                        })
                      }
                      options={[
                        { label: "Student", value: "student" },
                        { label: "Researcher", value: "researcher" },
                        { label: "Technician", value: "technician" },
                        { label: "Admin", value: "admin" },
                      ]}
                    />
                  </div>
                  <InputField
                    id="city"
                    label="City"
                    value={registerForm.city}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        city: e.target.value,
                      })
                    }
                    required
                  />

                  <FileUpload
                    label="Profile Picture"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    preview
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    
                  >
                    Sign Up
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
