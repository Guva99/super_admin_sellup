import { useEffect, useMemo, useState } from "react";
import { cabinetApi, usePublicPlans, type PublicPlan } from "@/entities/cabinet";
import { useSession } from "@/entities/session";
import { describeApiError } from "@/shared/api";
import { isWellFormedSlug, slugFromName } from "./slug";

export type SlugState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "free"; storefrontHost: string; adminHost: string }
  | { kind: "taken" | "reserved" | "invalid" };

export interface SignupFields {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  planCode: string;
  slug: string;
}

export interface SignupController {
  fields: SignupFields;
  plans: PublicPlan[];
  plansError: string | null;
  slugState: SlugState;
  isSubmitting: boolean;
  error: string | null;
  set: <K extends keyof SignupFields>(key: K, value: SignupFields[K]) => void;
  submit: () => Promise<void>;
}

/**
 * Регистрация бизнеса. Адрес подставляется из названия, пока человек не
 * поправит его сам; занят ли он — спрашиваем сервер с задержкой после ввода.
 */
export function useSignup(initialPlan: string | null, onSuccess: () => void): SignupController {
  const { signup } = useSession();
  const { plans, error: plansError } = usePublicPlans();
  const [fields, setFields] = useState<SignupFields>({
    companyName: "", fullName: "", email: "", phone: "", password: "", planCode: initialPlan ?? "", slug: "",
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>({ kind: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Тариф из ссылки лендинга (?plan=business) — если такой есть; иначе популярный.
  useEffect(() => {
    if (plans.length === 0) return;
    setFields((f) =>
      plans.some((p) => p.code === f.planCode) ? f : { ...f, planCode: plans.find((p) => p.code === "business")?.code ?? plans[0].code },
    );
  }, [plans]);

  const set: SignupController["set"] = (key, value) => {
    setFields((f) => {
      const next = { ...f, [key]: value };
      if (key === "companyName" && !slugEdited) next.slug = slugFromName(String(value));
      if (key === "slug") next.slug = String(value).toLowerCase().trim();
      return next;
    });
    if (key === "slug") setSlugEdited(true);
  };

  useEffect(() => {
    const slug = fields.slug;
    if (!slug) {
      setSlugState({ kind: "idle" });
      return;
    }
    if (!isWellFormedSlug(slug)) {
      setSlugState({ kind: "invalid" });
      return;
    }
    setSlugState({ kind: "checking" });
    let cancelled = false;
    const timer = setTimeout(() => {
      cabinetApi.slugAvailability(slug).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setSlugState({ kind: "idle" });
          return;
        }
        const a = result.data;
        setSlugState(
          a.available && a.storefrontHost && a.adminHost
            ? { kind: "free", storefrontHost: a.storefrontHost, adminHost: a.adminHost }
            : { kind: a.reason ?? "invalid" },
        );
      });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fields.slug]);

  const localError = useMemo(() => {
    if (!fields.companyName.trim()) return "Укажите название бизнеса";
    if (!fields.fullName.trim()) return "Укажите ваше имя";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) return "Укажите корректный email";
    if ([...fields.password].length < 8) return "Пароль — не короче 8 символов";
    if (!fields.planCode) return "Выберите тариф";
    if (slugState.kind === "invalid") return "Адрес — от 3 до 30 латинских букв, цифр или дефисов";
    if (slugState.kind === "taken") return "Этот адрес уже занят — выберите другой";
    if (slugState.kind === "reserved") return "Этот адрес зарезервирован — выберите другой";
    if (!fields.slug) return "Придумайте адрес";
    return null;
  }, [fields, slugState]);

  const submit = async () => {
    if (isSubmitting) return;
    if (localError) {
      setError(localError);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await signup({
      companyName: fields.companyName.trim(),
      fullName: fields.fullName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      password: fields.password,
      planCode: fields.planCode,
      slug: fields.slug,
    });
    setIsSubmitting(false);
    if (result.ok) onSuccess();
    else setError(describeApiError(result.error));
  };

  return { fields, plans, plansError, slugState, isSubmitting, error, set, submit };
}
