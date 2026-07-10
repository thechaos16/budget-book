import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { X, Delete, Lock } from 'lucide-react';

const PinEntryModal = ({ role, onSuccess, onClose }) => {
  const { fatherPin, motherPin } = useBudget();
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);

  const targetPin = role === 'father' ? fatherPin : motherPin;
  const roleName = role === 'father' ? '👨 아빠' : '👩 엄마';

  const handleNumberClick = (num) => {
    if (pin.length < 6 && !isError) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isError) {
      setPin(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === targetPin) {
        onSuccess();
      } else {
        setIsError(true);
        // Reset pin after a short delay for wiggle animation
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 500);
      }
    }
  }, [pin, targetPin, onSuccess]);

  return (
    <div className="pin-overlay">
      <div className={`pin-container ${isError ? 'shake-wiggle' : ''}`}>
        <button className="pin-close-btn" onClick={onClose} aria-label="닫기">
          <X size={24} />
        </button>

        <div className="pin-header">
          <div className="lock-icon-circle">
            <Lock className="lock-icon" size={24} />
          </div>
          <h2>{roleName} 인증</h2>
          <p className={isError ? 'error-text' : 'subtitle-text'}>
            {isError ? '비밀번호가 맞지 않아요! 다시 입력해주세요.' : '비밀번호 6자리를 눌러주세요.'}
          </p>
        </div>

        {/* 6 Dots representing password digits */}
        <div className="pin-dots">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < pin.length ? 'filled' : ''} ${isError ? 'error' : ''}`}
            />
          ))}
        </div>

        {/* Custom Numeric Keypad */}
        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              type="button"
              className="keypad-btn"
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="keypad-btn action-btn cancel-btn"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="keypad-btn"
            onClick={() => handleNumberClick('0')}
          >
            0
          </button>
          <button
            type="button"
            className="keypad-btn action-btn delete-btn"
            onClick={handleDelete}
            aria-label="지우기"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>

      <style>{`
        .pin-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          animation: fadeInOverlay 0.25s ease-out;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .pin-container {
          background: white;
          width: 100%;
          max-width: 380px;
          border-radius: var(--border-radius-lg);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 32px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 3px solid var(--kid-border);
        }

        .pin-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--kid-text-light);
          cursor: pointer;
          transition: var(--transition-smooth);
          padding: 4px;
          border-radius: 50%;
        }

        .pin-close-btn:hover {
          background: #f1f5f9;
          color: var(--kid-text);
        }

        .pin-header {
          text-align: center;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .lock-icon-circle {
          width: 54px;
          height: 54px;
          background: #fef2f2;
          color: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fee2e2;
        }

        .pin-header h2 {
          font-size: 1.4rem;
          color: var(--kid-text);
          font-family: var(--font-child);
        }

        .subtitle-text {
          font-size: 0.85rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .error-text {
          font-size: 0.85rem;
          color: #ef4444;
          font-weight: 700;
        }

        .pin-dots {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .pin-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2.5px solid #cbd5e1;
          transition: all 0.15s ease-in-out;
        }

        .pin-dot.filled {
          background: var(--kid-primary);
          border-color: var(--kid-primary);
          transform: scale(1.15);
        }

        .pin-dot.filled.error {
          background: #ef4444;
          border-color: #ef4444;
        }

        /* Shake Keyframes */
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-12px); }
          40%, 80% { transform: translateX(12px); }
        }

        .shake-wiggle {
          animation: wiggle 0.4s ease-in-out;
        }

        /* Keypad Styles */
        .pin-keypad {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          max-width: 280px;
        }

        .keypad-btn {
          height: 60px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: #f8fafc;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--kid-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-bounce);
          outline: none;
        }

        .keypad-btn:hover {
          background: #e2e8f0;
          transform: scale(1.05);
        }

        .keypad-btn:active {
          transform: scale(0.95);
        }

        .keypad-btn.action-btn {
          font-size: 0.95rem;
          border: none;
          background: transparent;
          color: var(--kid-text-light);
        }

        .keypad-btn.action-btn:hover {
          background: #f1f5f9;
          color: var(--kid-text);
          border-radius: var(--border-radius-sm);
        }

        .keypad-btn.delete-btn {
          color: #ef4444;
        }

        .keypad-btn.delete-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
};

export default PinEntryModal;
