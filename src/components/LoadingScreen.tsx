import { useEffect, useRef, useState } from 'react';
import '../styles/loading-screen.css';

interface LoadingScreenProps {
  onComplete: () => void;
  darkMode: boolean;
}

export function LoadingScreen({ onComplete, darkMode }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const particlesContainerRef = useRef<HTMLDivElement>(null);

  const statusMessages = [
    'Initializing Secure Environment...',
    'Scanning Connected Devices...',
    'Preparing Secure Wipe Engine...',
  ];

  useEffect(() => {
    // Generate particles
    if (particlesContainerRef.current) {
      const particleCount = 20;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'loading-screen__particle';

        const angle = (i / particleCount) * 360;
        const startRadius = 100;
        const endRadius = 60;

        const startX = Math.cos((angle * Math.PI) / 180) * startRadius;
        const startY = Math.sin((angle * Math.PI) / 180) * startRadius;
        const endX = Math.cos((angle * Math.PI) / 180) * endRadius;
        const endY = Math.sin((angle * Math.PI) / 180) * endRadius;

        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`;

        // Create inline keyframe
        particle.style.animation = `particleMove${i} 2s ease-in-out infinite alternate`;

        const styleSheet = document.styleSheets[0];
        const keyframes = `
          @keyframes particleMove${i} {
            0% {
              transform: translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px));
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px));
              opacity: 0.8;
            }
          }
        `;

        try {
          styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        } catch (e) {
          // Handle if rule already exists
        }

        particlesContainerRef.current.appendChild(particle);
      }
    }

    // Status progression
    const statusInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < statusMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 1000);

    // Auto-complete after 3.5 seconds
    const completeTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3500);

    return () => {
      clearInterval(statusInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen ${darkMode ? 'dark' : ''} ${isExiting ? 'exit' : ''}`}>
      {/* Background */}
      <div className="loading-screen__background">
        <div className="loading-screen__blur-circle loading-screen__blur-circle--blue"></div>
        <div className="loading-screen__blur-circle loading-screen__blur-circle--green"></div>
      </div>



      {/* Main Content */}
      <div className="loading-screen__content">

        {/* Shield Container */}
        <div className="loading-screen__shield-container">
          <div ref={particlesContainerRef}></div>

          <div className="loading-screen__shield-wrapper">
            <div className="loading-screen__shield-glass">
              {/* Shield Icon */}
              <svg className="loading-screen__shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>

              {/* Lock Icon */}
              <svg className="loading-screen__lock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div className="loading-screen__outer-ring"></div>
        </div>

        {/* Logo */}
        <div className="loading-screen__logo">
          <h1 className="loading-screen__title">SecureWipe Pro</h1>
          <div className="loading-screen__divider"></div>
        </div>

        {/* Status */}
        <div className="loading-screen__status-container">
          <div className="loading-screen__status-glass">
            <svg className="loading-screen__scan-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>

            <p key={currentStep} className="loading-screen__status-text">
              {statusMessages[currentStep]}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}