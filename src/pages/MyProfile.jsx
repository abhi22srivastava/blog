import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, KeyRound, UserRound, X } from "lucide-react";
import Header from "../components/Header";
import DashboardSidebar from "../components/DashboardSidebar";
import { calculateProfileCompletion } from "../utils/profileCompletion";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const getProfileImageUrl = (profilePicture) => {
  if (!profilePicture) {
    return `${API_BASE_URL}/frontend/images/largeimg.jpg`;
  }

  if (/^https?:\/\//i.test(profilePicture)) {
    return profilePicture;
  }

  const cleanedPath = String(profilePicture).replace(/^storage\//i, "");
  return `${API_BASE_URL}/storage/${cleanedPath}`;
};

export default function MyProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(storedUser || {});
  const [form, setForm] = useState({
    slug: storedUser?.slug || "",
    phone: storedUser?.phone || "",
    address: storedUser?.address || "",
    bio: storedUser?.bio || "",
    expertise: storedUser?.expertise || "",
    profile_picture: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [slugStatus, setSlugStatus] = useState({ slug: "", available: null, checking: false, error: "" });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const slug = form.slug.trim();
    if (!slug || slug === user?.slug || !SLUG_PATTERN.test(slug) || slug.length > 50) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSlugStatus({ slug, available: null, checking: true, error: "" });
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile/slug-availability?slug=${encodeURIComponent(slug)}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not check slug availability.");
        const result = await response.json();
        setSlugStatus({ slug, available: result.available, checking: false, error: "" });
      } catch (error) {
        if (error.name !== "AbortError") setSlugStatus({ slug, available: null, checking: false, error: error.message });
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.slug, token, user?.slug]);

  const completionPercent = calculateProfileCompletion(user);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setForm((current) => ({ ...current, profile_picture: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const slug = form.slug.trim();
      if (slug && slug !== user?.slug) {
        const checkResponse = await fetch(`${API_BASE_URL}/api/user/profile/slug-availability?slug=${encodeURIComponent(slug)}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!checkResponse.ok) throw new Error("Could not check slug availability. Please try again.");
        const result = await checkResponse.json();
        setSlugStatus({ slug, available: result.available, checking: false, error: "" });
        if (!result.available) throw new Error("This profile slug is taken. Choose another one.");
      }
      const data = new FormData();
      if (slug) data.append("slug", slug);
      if (form.phone) data.append("phone", form.phone);
      if (form.address) data.append("address", form.address);
      if (form.bio) data.append("bio", form.bio);
      data.append("expertise", form.expertise);
      if (form.profile_picture) data.append("profile_picture", form.profile_picture);

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: data,
      });

      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors?.slug) {
          setSlugStatus({ slug, available: false, checking: false, error: "" });
          throw new Error("This profile slug is taken or invalid. Choose another one.");
        }
        throw new Error(payload.message || "Unable to save profile.");
      }

      const updatedUser = payload.profile || { ...user, ...payload.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setForm({
        slug: updatedUser.slug || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        bio: updatedUser.bio || "",
        expertise: updatedUser.expertise || "",
        profile_picture: null,
      });
      setMessage("Profile saved successfully.");
      setSlugStatus({ slug: "", available: null, checking: false, error: "" });
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError("The new password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });
      const payload = await response.json();
      if (!response.ok) {
        const firstValidationError = Object.values(payload.errors || {}).flat()[0];
        throw new Error(firstValidationError || payload.message || "Unable to change password.");
      }

      setPasswordMessage(payload.message || "Password changed successfully.");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      window.setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordMessage("");
      }, 900);
    } catch (error) {
      setPasswordError(error.message || "Unable to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col bg-slate-100 lg:flex-row">
        <DashboardSidebar user={user} completionPercent={completionPercent} />

        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 lg:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Account</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">My Profile</h1>
              </div>
              <button type="button" onClick={() => { setPasswordError(""); setPasswordMessage(""); setChangePasswordOpen(true); }} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <KeyRound size={17} />
                <span className="hidden sm:inline">Change password</span>
                <span className="sm:hidden">Password</span>
              </button>
            </div>

            <div className="mb-8 flex items-center gap-4 rounded-3xl border border-indigo-100 bg-linear-to-r from-indigo-50 via-white to-purple-50 p-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-sm">
                {user?.profile_picture ? (
                  <img src={getProfileImageUrl(user.profile_picture)} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={36} className="text-slate-500" />
                )}
              </div>
              <div>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Profile completion {completionPercent}%
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{user?.name || "Your profile"}</h2>
              </div>
            </div>

            <div className="mb-8 h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-linear-to-r from-emerald-400 via-cyan-400 to-indigo-500" style={{ width: `${completionPercent}%` }} />
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Profile slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={50} aria-describedby="slug-availability" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="your-profile-name" />
                <p id="slug-availability" aria-live="polite" className={`text-xs ${slugStatus.slug === form.slug.trim() && slugStatus.available === false ? "text-red-600" : "text-slate-500"}`}>
                  {form.slug.trim() === user?.slug ? "This is your current slug." :
                    slugStatus.slug !== form.slug.trim() ? "" :
                    slugStatus.checking ? "Checking availability..." :
                    slugStatus.error || (slugStatus.available === true ? "This slug is available." : slugStatus.available === false ? "This slug is taken. Choose another one." : "")}
                </p>
                <p className="text-xs text-slate-500">Your profile URL: /profile/{form.slug || "your-profile-name"}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Contact number</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="+1 234 567 890" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Address</label>
                <input name="address" value={form.address} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Your city, country" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Bio / short line</label>
                <textarea name="bio" rows="5" value={form.bio} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="Write a short bio about yourself" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Expertise</label>
                <textarea name="expertise" rows="3" maxLength={500} value={form.expertise} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" placeholder="For example: Product design, technology, and writing" />
                <p className="text-xs text-slate-500">Share the subjects and skills you write about.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Profile picture</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
              </div>

              {message && (
                <div className={`md:col-span-2 rounded-xl border px-4 py-3 text-sm ${message === "Profile saved successfully." ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {message}
                </div>
              )}

              <div className="md:col-span-2">
                <button type="submit" disabled={saving || (slugStatus.slug === form.slug.trim() && slugStatus.available === false)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">
                  <Camera size={18} />
                  {saving ? "Saving profile..." : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      {changePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !passwordSaving) setChangePasswordOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><KeyRound size={21} /></div>
                <h2 id="change-password-title" className="text-xl font-bold text-slate-900">Change password</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your current password and choose a new one.</p>
              </div>
              <button type="button" aria-label="Close" disabled={passwordSaving} onClick={() => setChangePasswordOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={19} /></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {[
                ["current_password", "Current password", "current-password"],
                ["password", "New password", "new-password"],
                ["password_confirmation", "Confirm new password", "new-password"],
              ].map(([name, label, autocomplete]) => (
                <label key={name} className="block space-y-2 text-sm font-semibold text-slate-700">
                  {label}
                  <input type="password" name={name} autoComplete={autocomplete} required minLength={name === "current_password" ? undefined : 8} maxLength={128} value={passwordForm[name]} onChange={(event) => setPasswordForm((current) => ({ ...current, [name]: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
                </label>
              ))}
              {passwordError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</p>}
              {passwordMessage && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={passwordSaving} onClick={() => setChangePasswordOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={passwordSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
