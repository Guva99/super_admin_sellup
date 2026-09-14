import { useState } from "react";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";

export interface LoginController {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  submit: () => Promise<void>;
}

/** Состояние и правила формы входа. onSuccess — куда уйти после входа. */
export function useLogin(onSuccess: () => void): LoginController {
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (isSubmitting) return;
    if (!email.trim() || !password) {
      setError("Введите email и пароль");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(describeApiError(result.error));
      // Пароль не оставляем в поле после неудачи — как принято на экранах входа.
      setPassword("");
    }
  };

  return { email, password, isSubmitting, error, setEmail, setPassword, submit };
}
