import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { LoginDTO } from "@/types";

interface LoginFormProps {
  className?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  global?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const [formData, setFormData] = useState<LoginDTO>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear global error when user modifies form
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success) {
        // Success - redirect to home page
        window.location.href = "/";
      } else {
        // Handle authentication error
        setErrors({
          global: responseData.message || "Nieprawidłowy email lub hasło",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        global: "Wystąpił błąd podczas logowania. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className || ""}`}>
      <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Zaloguj się</CardTitle>
          <CardDescription className="text-muted-foreground">
            Wprowadź swoje dane, aby uzyskać dostęp do 10xCards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error Alert */}
            {errors.global && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errors.global}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Wprowadź swój adres e-mail"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                disabled={isLoading}
                className={errors.email ? "border-destructive focus-visible:border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive font-medium" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Hasło
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Wprowadź swoje hasło"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                aria-invalid={!!errors.password}
                disabled={isLoading}
                className={errors.password ? "border-destructive focus-visible:border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive font-medium" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Logowanie...
                </div>
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
