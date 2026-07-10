import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Sparkles, Heart, Database, ArrowRight, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const { registerFamily, connectFamily, dbMode } = useBudget();
  
  // Wizards steps: 'action_setup' | 'create_family' | 'connect_family'
  const [step, setStep] = useState(() => {
    return dbMode === 'cloud' ? 'action_setup' : 'create_family';
  });

  // Family Inputs
  const [name, setName] = useState('');
  const [dadPin, setDadPin] = useState('');
  const [momPin, setMomPin] = useState('');
  const [pairCode, setPairCode] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('가족 이름을 입력해주세요.');
      return;
    }

    if (dadPin.length !== 6 || !/^\d+$/.test(dadPin)) {
      alert('아빠 비밀번호는 숫자 6자리여야 합니다.');
      return;
    }

    if (momPin.length !== 6 || !/^\d+$/.test(momPin)) {
      alert('엄마 비밀번호는 숫자 6자리여야 합니다.');
      return;
    }

    registerFamily(name.trim(), dadPin, momPin);
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();

    if (!pairCode.trim()) {
      alert('연결할 가족 코드를 입력해주세요.');
      return;
    }

    const success = await connectFamily(pairCode.trim().toUpperCase());
    if (success) {
      alert('가족 저금통 연결에 성공했습니다! 🎉');
    }
  };

  return (
    <div className="register-overlay">
      <div className="register-container">
        
        {/* Step 1: Action Choice (Only shown in Cloud Mode) */}
        {step === 'action_setup' && (
          <div>
            <div className="register-header">
              <div className="register-logo-badge">🐖</div>
              <h2>어떻게 시작할까요?</h2>
              <p>새로 만드시거나, 다른 기기에서 만든 저금통을 불러오세요.</p>
            </div>

            <div className="action-buttons-list">
              <button 
                onClick={() => setStep('create_family')}
                className="action-choice-btn create-choice-btn bounce-hover"
              >
                <Sparkles size={24} />
                <div className="btn-choice-details">
                  <strong>새로운 가족 저금통 만들기</strong>
                  <span>새로 저금통을 시작하고 패밀리 코드를 생성합니다.</span>
                </div>
              </button>

              <button 
                onClick={() => setStep('connect_family')}
                className="action-choice-btn connect-choice-btn bounce-hover"
              >
                <Database size={24} />
                <div className="btn-choice-details">
                  <strong>기존 가족 저금통 연결하기</strong>
                  <span>이미 생성된 패밀리 코드를 사용하여 연동합니다.</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Create Family Registration */}
        {step === 'create_family' && (
          <div>
            <div className="register-header">
              <div className="register-logo-badge">✨</div>
              <h2>가족 저금통 만들기</h2>
              <p>우리 가족의 용돈 저금통 이름과 아빠/엄마 번호를 설정해요.</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="register-form">
              <div className="form-group">
                <label>저금통 이름</label>
                <input
                  type="text"
                  placeholder="예: 민규네 행복 저금통"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>아빠 비밀번호 (숫자 6자리)</label>
                <input
                  type="password"
                  placeholder="예: 111111"
                  value={dadPin}
                  onChange={(e) => setDadPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>엄마 비밀번호 (숫자 6자리)</label>
                <input
                  type="password"
                  placeholder="예: 222222"
                  value={momPin}
                  onChange={(e) => setMomPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="btn-row">
                {dbMode === 'cloud' && (
                  <button type="button" onClick={() => setStep('action_setup')} className="btn-back">
                    이전
                  </button>
                )}
                <button type="submit" className="register-submit-btn flex-1">
                  <Sparkles size={18} />
                  <span>만들기 완료!</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Connect Existing Family */}
        {step === 'connect_family' && (
          <div>
            <div className="register-header">
              <div className="register-logo-badge">🔗</div>
              <h2>기존 저금통 연동하기</h2>
              <p>다른 기기에 표시된 가족 코드를 입력하여 연결하세요.</p>
            </div>

            <form onSubmit={handleConnectSubmit} className="register-form">
              <div className="form-group">
                <label>가족 코드 (Family Code)</label>
                <input
                  type="text"
                  placeholder="예: FAM-ABC123"
                  value={pairCode}
                  onChange={(e) => setPairCode(e.target.value)}
                  required
                />
              </div>

              <div className="btn-row">
                <button type="button" onClick={() => setStep('action_setup')} className="btn-back">
                  이전
                </button>
                <button type="submit" className="register-submit-btn flex-1">
                  <span>저금통 연결하기</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="register-footer">
          <Heart className="heart-icon" size={14} />
          <span>아이가 보는 화면은 항상 비밀번호 입력 없이 즉시 연결됩니다!</span>
        </div>
      </div>

      <style>{`
        .register-overlay {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #fff9e6 0%, #ffeef2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .register-container {
          background: white;
          width: 100%;
          max-width: 480px;
          border-radius: var(--border-radius-lg);
          border: 3px solid var(--kid-border);
          box-shadow: var(--shadow-lg);
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          animation: scaleUp 0.3s ease-out;
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .register-header {
          text-align: center;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .register-logo-badge {
          font-size: 3rem;
          margin-bottom: 4px;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .register-header h2 {
          font-family: var(--font-child);
          font-size: 1.5rem;
          color: var(--kid-text);
        }

        .register-header p {
          font-size: 0.85rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .register-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Action choice buttons */
        .action-buttons-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .action-choice-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px;
          border-radius: var(--border-radius-md);
          border: 2px solid #e2e8f0;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .action-choice-btn strong {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--kid-text);
          margin-bottom: 2px;
        }

        .action-choice-btn span {
          font-size: 0.75rem;
          color: var(--kid-text-light);
          line-height: 1.3;
        }

        .create-choice-btn {
          border-color: #ffe4e6;
          color: var(--kid-primary);
        }
        .create-choice-btn:hover {
          background: #fff5f7;
          border-color: var(--kid-primary);
        }

        .connect-choice-btn {
          border-color: #e0f2fe;
          color: var(--father-primary);
        }
        .connect-choice-btn:hover {
          background: #f0f9ff;
          border-color: var(--father-primary);
        }

        /* General Forms elements */
        .register-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .register-form label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--kid-text-light);
        }

        .register-form input {
          padding: 12px;
          border: 2px solid #ffd1dc;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition-smooth);
          width: 100%;
          font-family: var(--font-child);
        }

        .register-form input:focus {
          border-color: var(--kid-primary);
        }

        .btn-row {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .btn-back {
          padding: 14px 20px;
          background: #f1f5f9;
          border: 2px solid #cbd5e1;
          color: #475569;
          font-weight: 700;
          cursor: pointer;
          border-radius: var(--border-radius-sm);
          transition: var(--transition-smooth);
        }

        .btn-back:hover {
          background: #e2e8f0;
        }

        .register-submit-btn {
          padding: 14px;
          border: none;
          background: linear-gradient(135deg, var(--kid-primary) 0%, #ff8e53 100%);
          color: white;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-bounce);
        }

        .register-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .register-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--kid-text-light);
          font-weight: 600;
          text-align: center;
          border-top: 1px dashed #f1f5f9;
          padding-top: 16px;
        }

        .heart-icon {
          color: var(--kid-primary);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
