"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <aside className="image-panel" aria-label="A space to create">
        <Image
          src="/images/login-writer.png"
          alt="A smiling woman in a red blouse writing an article on her laptop."
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          preload
          style={{ objectFit: "cover", objectPosition: "center 35%" }}
        />
      </aside>

      <section className="form-panel" aria-labelledby="login-heading">
        <Link href="/" className="brand" aria-label="Sanfiley Publishing home">
          Sanfiley
        </Link>

        <div className="form-wrap">
          <h1 id="login-heading">Welcome back</h1>
          <p className="subtitle">Sign in to publish your articles</p>

          <form onSubmit={handleSubmit} aria-busy={loading}>
            <label htmlFor="password">Password</label>
            <div className={`password-wrap${error ? " invalid" : ""}`}>
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
              />
              <button
                className="toggle-password"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {error && <div id="login-error" className="error" role="alert">{error}</div>}
            <button type="submit" className="sign-in" disabled={loading}>
              <span>{loading ? "Signing in" : "Sign in"}</span>
            </button>
          </form>
        </div>

        <footer className="form-footer">
          <Link href="/">Back to website</Link>
        </footer>
      </section>


      <style jsx>{`
        .login-page {
          --login-red: #c92836;
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 14px;
          background: #fff;
          color: #231f20;
        }
        .form-panel {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 34px clamp(24px, 5vw, 88px) 24px;
        }
        .brand { display: inline-flex; align-items: center; gap: 12px; align-self: flex-start; font-size: 28px; font-weight: 750; letter-spacing: -1px; color: var(--login-red); }
        .form-wrap { width: 100%; max-width: 410px; margin: auto; padding: 72px 0; }
        h1 { font-size: clamp(35px, 3.6vw, 54px); letter-spacing: -2px; line-height: 1.12; margin: 0 0 19px; font-weight: 650; }
        .subtitle { font-size: 15px; color: #777075; line-height: 1.8; margin: 0 0 37px; }
        label { display: block; font-size: 13px; font-weight: 650; margin-bottom: 10px; }
        .password-wrap { display: flex; align-items: center; gap: 12px; padding-left: 16px; border: 1px solid #e6e0e1; border-radius: 9px; color: #93888c; background: #fff; transition: border-color .15s, box-shadow .15s; }
        .password-wrap:focus-within { border-color: var(--login-red); box-shadow: 0 0 0 3px #c9283610; }
        .password-wrap.invalid { border-color: var(--login-red); }
        input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: #231f20; padding: 17px 0; font: inherit; font-size: 14px; }
        input::placeholder { color: #9c9296; }
        .toggle-password { border: 0; background: none; color: #82777b; cursor: pointer; min-width: 48px; min-height: 48px; display: grid; place-items: center; border-radius: 8px; }
        .toggle-password:hover { color: var(--login-red); }
        .sign-in { width: 100%; margin-top: 22px; display: flex; justify-content: center; align-items: center; gap: 18px; border: 0; border-radius: 9px; padding: 17px 20px; background: var(--login-red); color: white; font-size: 14px; font-weight: 650; cursor: pointer; transition: background .15s; }
        .sign-in:hover { background: #ad1d2a; }
        .sign-in:disabled { opacity: .6; cursor: wait; }
        .error { color: #a51a27; background: #fff1f2; border-radius: 7px; font-size: 13px; padding: 12px; margin-top: 12px; }
        .form-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 11px; color: #91878a; }
        .form-footer a { display: inline-flex; align-items: center; gap: 4px; color: #51474b; }
        .form-footer a:hover { color: var(--login-red); }
        .image-panel { position: relative; min-height: 690px; border-radius: 18px; overflow: hidden; background: #f2e9e4; }
        a:focus-visible, button:focus-visible { outline: 2px solid var(--login-red); outline-offset: 4px; }
        @media (min-width: 1600px) { .image-panel { max-height: 1100px; } }
        @media (max-width: 1000px) { .form-panel { padding: 25px; } .form-footer { line-height: 1.6; } }
        @media (max-width: 760px) {
          .login-page { grid-template-columns: 1fr; padding: 10px; }
          .form-panel { padding: 22px 18px 28px; order: -1; }
          .form-wrap { padding: 62px 0 48px; }
          h1 { font-size: 43px; }
          .image-panel { display: none; }
        }
      `}</style>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
