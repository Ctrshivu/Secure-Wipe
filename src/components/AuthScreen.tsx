import { useEffect, useRef, useState } from "react";
import "../styles/auth-screen.css";
// NOTE: Ensure your actual component imports (icons, etc.) are present here.

interface AuthScreenProps {
  onAuthenticate: () => void;
  darkMode: boolean;
}

export function AuthScreen({ onAuthenticate, darkMode }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isExiting, setIsExiting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const binaryRainRef = useRef<HTMLDivElement>(null);
  const orbitingParticlesRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate binary rain
    if (binaryRainRef.current) {
      const itemCount = 20;
      for (let i = 0; i < itemCount; i++) {
        const item = document.createElement("div");
        item.className = "auth-screen__binary-item";
        item.textContent = Math.random() > 0.5 ? "1" : "0";
        item.style.left = `${i * 5}%`;
        item.style.animationDuration = `${Math.random() * 5 + 5}s`;
        item.style.animationDelay = `${Math.random() * 5}s`;
        binaryRainRef.current.appendChild(item);
      }
    }

    // Generate orbiting particles
    if (orbitingParticlesRef.current) {
      const particleCount = 8;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "auth-screen__particle";

        const angle = i * 45;
        const radius = 80;
        particle.style.transformOrigin = `${
          Math.cos((angle * Math.PI) / 180) * radius
        }px ${Math.sin((angle * Math.PI) / 180) * radius}px`;

        particle.style.animation = `orbitParticle 4s linear infinite`;
        particle.style.animationDelay = `${i * 0.5}s`;

        orbitingParticlesRef.current.appendChild(particle);
      }
    }

    // 📱 Handle mobile viewport resize (keyboard open/close)
    const handleResize = () => {
      if (window.innerWidth <= 768 && formContainerRef.current) {
        formContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onAuthenticate();
      }, 500);
    }, 500);
  };

  return (
    <div
      className={`auth-screen ${darkMode ? "dark" : ""} ${
        isExiting ? "exit" : ""
      }`}
    >
      {/* Background */}
      <div className="auth-screen__background">
        <div className="auth-screen__orb auth-screen__orb--blue"></div>
        <div className="auth-screen__orb auth-screen__orb--green"></div>
        <div className="auth-screen__binary-rain" ref={binaryRainRef}></div>
      </div>

      {/* Main card */}
      <div className="auth-screen__card">
        {/* Left side - Branding */}
        <div className="auth-screen__branding">
          <div className="auth-screen__shield-container">
            <div className="auth-screen__shield-wrapper">
              <div className="auth-screen__shield-glass">
                <svg
                  className="auth-screen__shield-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
            </div>
            <div ref={orbitingParticlesRef}></div>
          </div>

          <div className="auth-screen__tagline">
            <h2 className="auth-screen__tagline-title">
              Permanently Secure
              <br />
              Your data.
            </h2>
            <p className="auth-screen__tagline-subtitle">
              Powered by AI-driven data sanitization.
            </p>
          </div>

          <svg className="auth-screen__svg">
            <circle
              className="auth-screen__circle auth-screen__circle--small"
              cx="50%"
              cy="50%"
              r="100"
            />
            <circle
              className="auth-screen__circle auth-screen__circle--large"
              cx="50%"
              cy="50%"
              r="150"
            />
          </svg>
        </div>

        {/* Right side - Auth form */}
        <div className="auth-screen__form-container" ref={formContainerRef}>
          <div className="auth-screen__header">
            <h3 className="auth-screen__title">Welcome back, Operator.</h3>
            <p className="auth-screen__subtitle">
              Access your secure environment.
            </p>
          </div>

          <div className="auth-screen__tabs">
            <div className="auth-screen__tabs-list">
              <button
                className={`auth-screen__tab-trigger ${
                  activeTab === "login"
                    ? "auth-screen__tab-trigger--active"
                    : ""
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`auth-screen__tab-trigger ${
                  activeTab === "signup"
                    ? "auth-screen__tab-trigger--active"
                    : ""
                }`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </button>
            </div>

            {/*
              FIX: Wrap the form contents in a container that will manage the height.
              The height management must be done in CSS for this approach.
              We use a single wrapper with position: relative for the form content.
            */}
            <div className="auth-screen__form-content-wrapper">
              {/* Login form */}
              <div
                className={`auth-screen__tab-content ${
                  activeTab === "login"
                    ? "auth-screen__tab-content--active"
                    : ""
                }`}
              >
                <form className="auth-screen__form" onSubmit={handleSubmit}>
                  <div className="auth-screen__input-group">
                    <div className="auth-screen__input-wrapper">
                      <svg
                        className="auth-screen__input-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <input
                        type="email"
                        className="auth-screen__input"
                        placeholder="Email / Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-screen__input-group">
                    <div className="auth-screen__input-wrapper">
                      <svg
                        className="auth-screen__input-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      <input
                        type="password"
                        className="auth-screen__input auth-screen__input--password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-screen__button">
                    Access System
                    <svg
                      className="auth-screen__button-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Sign Up form */}
              <div
                className={`auth-screen__tab-content ${
                  activeTab === "signup"
                    ? "auth-screen__tab-content--active"
                    : ""
                }`}
              >
                <form className="auth-screen__form" onSubmit={handleSubmit}>
                  <div className="auth-screen__input-group">
                    <div className="auth-screen__input-wrapper">
                      <svg
                        className="auth-screen__input-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                      <input
                        type="text"
                        className="auth-screen__input"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-screen__input-group">
                    <div className="auth-screen__input-wrapper">
                      <svg
                        className="auth-screen__input-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <input
                        type="email"
                        className="auth-screen__input"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-screen__input-group">
                    <div className="auth-screen__input-wrapper">
                      <svg
                        className="auth-screen__input-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      <input
                        type="password"
                        className="auth-screen__input auth-screen__input--password"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-screen__button">
                    Create Account
                    <svg
                      className="auth-screen__button-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
