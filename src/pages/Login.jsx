import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Feather } from "lucide-react";
import { FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [register, setRegister] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(0);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [fields, setFields] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    const googleToken = searchParams.get("google_token");
    const facebookError = searchParams.get("facebook_error");
    const facebookToken = searchParams.get("facebook_token");
    const linkedinError = searchParams.get("linkedin_error");
    const linkedinToken = searchParams.get("linkedin_token");
    const encodedUser = searchParams.get("google_user") || searchParams.get("facebook_user") || searchParams.get("linkedin_user");
    const socialToken = googleToken || facebookToken || linkedinToken;

    if (googleError || facebookError || linkedinError) {
      setError(googleError || facebookError || linkedinError);
      setSearchParams({}, { replace: true });
      return;
    }

    if (socialToken && encodedUser) {
      try {
        const user = JSON.parse(atob(encodedUser));
        localStorage.setItem("token", socialToken);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard", { replace: true });
      } catch {
        setError("Social sign-in returned an invalid account response.");
        setSearchParams({}, { replace: true });
      }
    }
  }, [navigate, searchParams, setSearchParams]);

  function signInWithGoogle() {
    setError("");
    window.location.assign(`${API_BASE_URL}/api/google/redirect`);
  }

  function signInWithFacebook() {
    setError("");
    window.location.assign(`${API_BASE_URL}/api/facebook/redirect`);
  }

  function signInWithLinkedIn() {
    setError("");
    window.location.assign(`${API_BASE_URL}/api/linkedin/redirect`);
  }

  if (localStorage.getItem("token")) return <Navigate to="/dashboard" replace />;

  function switchMode(value) {
    setRegister(value);
    setForgotPassword(false);
    setForgotStep(0);
    setOtpStep(false);
    setOtpCode("");
    setError("");
    setNotice("");
    setFields((current) => ({ ...current, password: "", password_confirmation: "" }));
  }

  function startForgotPassword() {
    setRegister(false);
    setForgotPassword(true);
    setForgotStep(0);
    setOtpCode("");
    setError("");
    setNotice("");
    setFields((current) => ({ ...current, password: "", password_confirmation: "" }));
  }

  async function requestOtp() {
    const email = fields.email.trim();
    if (!email) throw new Error("Please enter your email address.");

    const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(Object.values(data.errors || {}).flat()[0] || data.message || "Unable to send OTP. Please try again.");
    }

    setOtpStep(true);
    setOtpCode("");
    setError("OTP sent to your email. Please check your inbox.");
  }

  async function verifyOtpAndRegister() {
    const email = fields.email.trim();
    if (!email) throw new Error("Please enter your email address.");
    if (!otpCode || otpCode.length !== 6) throw new Error("Please enter a valid 6-digit OTP.");

    const verifyResponse = await fetch(`${API_BASE_URL}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, otp: otpCode }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) {
      throw new Error(Object.values(verifyData.errors || {}).flat()[0] || verifyData.message || "OTP verification failed.");
    }

    const registerResponse = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...fields, email, name: fields.name.trim() }),
    });

    const registerData = await registerResponse.json();
    if (!registerResponse.ok) {
      throw new Error(Object.values(registerData.errors || {}).flat()[0] || registerData.message || "Unable to create account. Please try again.");
    }

    if (!registerData.token || !registerData.user) throw new Error("Unable to start your session.");
    localStorage.setItem("token", registerData.token);
    localStorage.setItem("user", JSON.stringify(registerData.user));
    setOtpStep(false);
    setOtpCode("");
    navigate("/dashboard", { replace: true });
  }

  async function submit(event) {
    event.preventDefault();
    if (!register && !forgotPassword) {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...fields, email: fields.email.trim() }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(Object.values(data.errors || {}).flat()[0] || data.message || "Unable to continue. Please try again.");
        if (!data.token || !data.user) throw new Error("Unable to start your session.");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard", { replace: true });
      } catch (err) { setError(err.message || "Unable to connect. Please try again."); }
      finally { setLoading(false); }
      return;
    }

    if (register && otpStep && fields.password !== fields.password_confirmation) { setError("Passwords do not match."); return; }
    if (forgotPassword && forgotStep === 2 && fields.password !== fields.password_confirmation) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (register) {
        if (!otpStep) await requestOtp();
        else await verifyOtpAndRegister();
      } else if (forgotPassword) {
        const email = fields.email.trim();
        if (!email) throw new Error("Please enter your email address.");
        if (forgotStep > 0 && (!otpCode || otpCode.length !== 6)) throw new Error("Please enter the 6-digit code sent to your email.");

        const endpoint = forgotStep === 0
          ? "/api/forgot-password/send-otp"
          : forgotStep === 1
            ? "/api/forgot-password/verify-otp"
            : "/api/forgot-password/reset";
        const payload = { email, ...(forgotStep > 0 ? { otp: otpCode } : {}) };
        if (forgotStep === 2) {
          payload.password = fields.password;
          payload.password_confirmation = fields.password_confirmation;
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(Object.values(data.errors || {}).flat()[0] || data.message || "Unable to reset password. Please try again.");

        if (forgotStep === 0) {
          setForgotStep(1);
          setOtpCode("");
          setNotice(data.message || "If an account exists, a reset code has been sent.");
        } else if (forgotStep === 1) {
          setForgotStep(2);
          setNotice(data.message || "Email verified. Choose a new password.");
        } else {
          setForgotPassword(false);
          setForgotStep(0);
          setOtpCode("");
          setFields((current) => ({ ...current, password: "", password_confirmation: "" }));
          setNotice(data.message || "Password reset. You can now sign in.");
        }
      }
    } catch (err) {
      setError(err.message || "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputs = [
    ...(register ? [{ key: "name", label: "Full name", type: "text", autoComplete: "name", placeholder: "Your name" }] : []),
    { key: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@example.com" },
    ...(register && otpStep || forgotPassword && forgotStep === 2
      ? [{ key: "password", label: "New password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" }, { key: "password_confirmation", label: "Confirm password", type: "password", autoComplete: "new-password", placeholder: "Repeat your password" }]
      : !register && !forgotPassword ? [{ key: "password", label: "Password", type: "password", autoComplete: "current-password", placeholder: "Enter your password" }] : []),
  ];

  const submitLabel = forgotPassword
    ? (forgotStep === 0 ? "Send reset code" : forgotStep === 1 ? "Verify code" : "Reset password")
    : register ? (otpStep ? "Verify OTP & create account" : "Send OTP") : "Sign in";

  return <>
  <Header />
    <main className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50 px-4 py-12 sm:py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white bg-white shadow-xl shadow-indigo-100/60 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-slate-950 p-8 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-indigo-200"><Feather size={15} />A space for your ideas</span>
            <h2 className="mt-8 text-4xl font-bold leading-tight tracking-tight">Read something new.<br /><span className="text-indigo-300">Write something yours.</span></h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">Discover stories, save your favourites, and share your perspective with a community of curious readers.</p>
          </div>
          <div className="relative mt-10 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-300"><BookOpen className="shrink-0 text-indigo-300" size={24} />Your next great story starts here.</div>
        </aside>
        <section className="p-6 sm:p-10 lg:p-12" aria-labelledby="auth-heading">
          {!forgotPassword && <div className="mb-8 flex rounded-xl bg-slate-100 p-1">{[false, true].map((mode) => <button key={String(mode)} type="button" disabled={loading} aria-pressed={register === mode} onClick={() => switchMode(mode)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${register === mode ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>{mode ? "Create account" : "Sign in"}</button>)}</div>}
          <h1 id="auth-heading" className="text-3xl font-bold tracking-tight text-slate-900">{forgotPassword ? "Reset your password" : register ? "Join the conversation" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-slate-500">{forgotPassword ? forgotStep === 0 ? "Enter your account email and we’ll send you a one-time code." : forgotStep === 1 ? "Enter the 6-digit code sent to your email." : "Your email is verified. Choose a new password." : register ? "Create your account to start reading and writing." : "Sign in to continue your reading and writing journey."}</p>
          {!register && !forgotPassword && (
            <>
              <div className="mt-6 grid grid-cols-3 gap-2"><button type="button" onClick={signInWithGoogle} disabled={loading} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"><FaGoogle size={19} className="text-red-500" aria-hidden="true" />Google</button><button type="button" onClick={signInWithFacebook} disabled={loading} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"><FaFacebookF size={19} className="text-blue-600" aria-hidden="true" />Facebook</button><button type="button" onClick={signInWithLinkedIn} disabled={loading} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"><FaLinkedinIn size={19} className="text-sky-700" aria-hidden="true" />LinkedIn</button></div>
              <p className="mt-2 text-xs text-slate-500">Sign in with Google, Facebook, LinkedIn, or continue with email below.</p>
              <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />Continue with email<span className="h-px flex-1 bg-slate-200" /></div>
            </>
          )}
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
          <form onSubmit={submit}><fieldset disabled={loading} className="space-y-4 disabled:opacity-60">
            {inputs.map(({ key, label, type, autoComplete, placeholder }) => <label key={key} className="block text-sm font-semibold text-slate-700">{label}<input required type={type} autoComplete={autoComplete} readOnly={forgotPassword && key === "email" && forgotStep > 0} minLength={(register || forgotPassword) && key === "password" ? 8 : undefined} maxLength={(register || forgotPassword) ? (type === "password" ? 128 : 255) : undefined} value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: e.target.value })} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 read-only:cursor-not-allowed read-only:bg-slate-100" /></label>)}
            {(register && otpStep || forgotPassword && forgotStep === 1) && (
              <label className="block text-sm font-semibold text-slate-700">
                OTP code
                <input required type="text" inputMode="numeric" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit code" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </label>
            )}
            {forgotPassword && forgotStep === 2 && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">Email verified. Your reset code is confirmed.</p>}
            {!register && !forgotPassword && <div className="-mt-1 text-right"><button type="button" onClick={startForgotPassword} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">Forgot password?</button></div>}
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">{loading ? "Please wait..." : submitLabel}<ArrowRight size={18} aria-hidden="true" /></button>
          </fieldset></form>
          <p className="mt-6 text-center text-sm text-slate-500">{forgotPassword ? "Remembered your password?" : register ? "Already have an account?" : "New here?"} <button type="button" disabled={loading} onClick={() => switchMode(forgotPassword ? false : !register)} className="font-semibold text-indigo-600 hover:underline">{forgotPassword ? "Back to sign in" : register ? "Sign in" : "Create an account"}</button></p>
        </section>
      </div>
    </main><Footer /></>;
}
