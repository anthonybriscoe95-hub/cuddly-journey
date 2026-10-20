"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Eye, EyeOff, Fingerprint, Shield, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("anthony@harborglass.com");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [code, setCode] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (password.length >= 4) {
      setStep("2fa");
    } else {
      setError("Invalid email or password.");
    }
  }

  async function handle2FA(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    if (code === "000000" || code.length === 6) {
      router.push("/");
    } else {
      setError("Invalid verification code. Use any 6-digit code.");
    }
  }

  function handleBiometric() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 1500);
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "rgb(var(--hg-bg))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background gradient blobs */}
      <div style={{
        position: "absolute",
        top: "-20%", left: "-10%",
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(10,132,255,0.12), transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-20%", right: "-10%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(100,210,255,0.08), transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      <div className="anim-fade" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72,
            background: "linear-gradient(135deg, rgb(var(--hg-blue-light)), rgb(var(--hg-cyan)))",
            borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(10,132,255,0.35)",
          }}>
            <Droplets size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 6 }}>
            Harbor Glass
          </h1>
          <p style={{ color: "rgb(var(--hg-text-secondary))", fontSize: 15 }}>
            {step === "login" ? "Sign in to your business dashboard" : "Two-factor authentication"}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          {step === "login" ? (
            <>
              {/* Passkey / Biometric option */}
              <button
                className="btn btn-secondary"
                style={{ width: "100%", marginBottom: 20, gap: 10 }}
                onClick={handleBiometric}
                disabled={loading}
              >
                <Fingerprint size={20} style={{ color: "rgb(var(--hg-blue-light))" }} />
                Sign in with Face ID / Touch ID
              </button>

              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                marginBottom: 20, color: "rgb(var(--hg-text-tertiary))", fontSize: 13,
              }}>
                <div style={{ flex: 1, height: 1, background: "rgb(var(--hg-border))" }} />
                or continue with email
                <div style={{ flex: 1, height: 1, background: "rgb(var(--hg-border))" }} />
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="input-label">Email</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@harborglass.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="input-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={{ paddingRight: 44 }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgb(var(--hg-text-tertiary))", padding: 4,
                      }}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ textAlign: "right", marginTop: 6 }}>
                    <span style={{ fontSize: 13, color: "rgb(var(--hg-blue-light))", cursor: "pointer", fontWeight: 500 }}>
                      Forgot password?
                    </span>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: "rgb(var(--hg-danger) / 0.1)",
                    border: "1px solid rgb(var(--hg-danger) / 0.2)",
                    borderRadius: 8, padding: "10px 14px",
                    color: "rgb(var(--hg-danger))", fontSize: 13, fontWeight: 500,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", marginTop: 4 }}
                >
                  {loading ? (
                    <span className="anim-spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                  ) : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handle2FA} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                width: 56, height: 56,
                background: "rgb(var(--hg-blue-light) / 0.12)",
                borderRadius: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px",
              }}>
                <Shield size={28} style={{ color: "rgb(var(--hg-blue-light))" }} />
              </div>

              <p style={{ textAlign: "center", fontSize: 14, color: "rgb(var(--hg-text-secondary))" }}>
                Enter the 6-digit code from your authenticator app.
                <br />
                <span style={{ fontSize: 12, color: "rgb(var(--hg-text-tertiary))", marginTop: 4, display: "block" }}>
                  (Demo: enter any 6 digits)
                </span>
              </p>

              <div>
                <label className="input-label">Verification Code</label>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: 22, fontWeight: 700 }}
                  autoFocus
                />
              </div>

              {error && (
                <div style={{
                  background: "rgb(var(--hg-danger) / 0.1)",
                  border: "1px solid rgb(var(--hg-danger) / 0.2)",
                  borderRadius: 8, padding: "10px 14px",
                  color: "rgb(var(--hg-danger))", fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={loading || code.length < 6}
                style={{ width: "100%" }}
              >
                {loading ? (
                  <span className="anim-spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                ) : "Verify & Enter"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: "100%" }}
                onClick={() => setStep("login")}
              >
                ← Back to login
              </button>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, marginTop: 20,
          fontSize: 12, color: "rgb(var(--hg-text-tertiary))",
        }}>
          <Lock size={12} />
          256-bit encrypted · Enterprise security · Admin only
        </div>
      </div>
    </div>
  );
}
