import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Sparkles, Shield, User } from 'lucide-react';

const Navbar = ({ onRequestRoleChange }) => {
  const { userRole, setUserRole } = useBudget();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const roles = [
    { id: 'kid', label: '아이 (나)', emoji: '👦', themeClass: 'role-kid' },
    { id: 'father', label: '아빠', emoji: '👨', themeClass: 'role-father' },
    { id: 'mother', label: '엄마', emoji: '👩', themeClass: 'role-mother' }
  ];

  const handleRoleClick = (roleId) => {
    if (userRole === roleId) return;
    if (roleId === 'kid') {
      setUserRole('kid');
    } else {
      onRequestRoleChange(roleId);
    }
  };

  return (
    <nav className="navbar-container">

      <div className="nav-logo">
        <span className="logo-emoji">💰</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="logo-text">꼬마 저금통</span>
          <span className="logo-sub" style={{ margin: 0, marginTop: '2px' }}>Kid's Budget Book</span>
        </div>
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="install-app-btn bounce-hover">
            📲 앱 다운로드
          </button>
        )}
        {isIOS && !isInstalled && (
          <button 
            onClick={() => alert('아이폰/아이패드 설치 방법:\n\n1. Safari 브라우저 하단의 [공유(📤)] 버튼을 누릅니다.\n2. 메뉴를 아래로 스크롤하여 [홈 화면에 추가(➕)]를 누릅니다.')} 
            className="install-app-btn bounce-hover"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            📲 앱 다운로드
          </button>
        )}
      </div>

      <div className="role-selector">
        <span className="selector-title">누구의 화면인가요?</span>
        <div className="role-buttons">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleClick(role.id)}
              className={`role-btn ${userRole === role.id ? 'active' : ''} ${role.themeClass}`}
            >
              <span className="role-emoji-icon">{role.emoji}</span>
              <span className="role-label">{role.label}</span>
              {userRole === role.id && <span className="active-dot" />}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .navbar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 2px solid var(--kid-border);
          box-shadow: var(--shadow-sm);
          border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
          margin-bottom: 30px;
          transition: var(--transition-smooth);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-emoji {
          font-size: 2rem;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .logo-text {
          font-family: var(--font-child);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--kid-text);
        }

        .logo-sub {
          font-size: 0.8rem;
          font-family: var(--font-parent);
          background: var(--kid-primary);
          color: white;
          padding: 2px 8px;
          border-radius: 20px;
          margin-left: 8px;
          font-weight: 600;
        }

        .install-app-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-bounce);
          margin-left: 12px;
          white-space: nowrap;
        }

        .install-app-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .role-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .selector-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--kid-text-light);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-buttons {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 500px;
          justify-content: center;
        }

        .role-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid transparent;
          border-radius: var(--border-radius-md);
          background: white;
          color: var(--kid-text);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-bounce);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .role-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .role-btn:active {
          transform: translateY(1px);
        }

        .role-btn.active {
          transform: translateY(-2px) scale(1.03);
        }

        .role-btn.active.role-kid {
          border-color: var(--kid-primary);
          background: #fff0f3;
          color: var(--kid-primary);
        }

        .role-btn.active.role-father {
          border-color: var(--father-primary);
          background: #eff6ff;
          color: var(--father-primary);
        }

        .role-btn.active.role-mother {
          border-color: var(--mother-primary);
          background: #fdf2f8;
          color: var(--mother-primary);
        }

        .role-emoji-icon {
          font-size: 1.3rem;
        }

        .active-dot {
          position: absolute;
          bottom: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        @media (max-width: 480px) {
          .navbar-container {
            padding: 16px 12px !important;
            gap: 12px !important;
          }
          
          .logo-text {
            font-size: 1.4rem !important;
          }

          .logo-emoji {
            font-size: 1.6rem !important;
          }

          .role-buttons {
            gap: 6px !important;
          }

          .role-btn {
            padding: 8px 6px !important;
            font-size: 0.8rem !important;
            gap: 4px !important;
            border-radius: var(--border-radius-sm) !important;
          }

          .role-emoji-icon {
            font-size: 1rem !important;
          }
          
          .selector-title {
            font-size: 0.75rem !important;
          }
        }

        @media (min-width: 768px) {
          .navbar-container {
            flex-direction: row;
            justify-content: space-between;
            padding: 20px 40px;
            gap: 24px;
          }

          .role-selector {
            align-items: flex-end;
            width: auto;
          }

          .role-buttons {
            width: auto;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
