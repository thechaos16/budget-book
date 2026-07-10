import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Send, ArrowDownCircle, Trash2, Trophy, Plus, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const ParentDashboard = () => {
  const { 
    userRole, 
    balance, 
    transactions, 
    goals, 
    fatherPin,
    motherPin,
    familyName,
    familyCode,
    dbMode,
    updateFatherPin,
    updateMotherPin,
    registerFamily,
    connectFamily,
    resetFamily,
    addDeposit, 
    addWithdrawal, 
    deleteTransaction, 
    addGoal, 
    deleteGoal 
  } = useBudget();

  // Form states for giving money
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCategory, setDepositCategory] = useState('pocket_money');
  const [depositMessage, setDepositMessage] = useState('');
  const [depositSticker, setDepositSticker] = useState('💰');

  // Form states for spending money
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawSticker, setWithdrawSticker] = useState('🍦');

  // Form states for adding goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  // Form states for passcode change
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Copy states
  const [isCopied, setIsCopied] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const parentName = userRole === 'father' ? '아빠' : '엄마';
  const isFather = userRole === 'father';

  const stickers = ['💰', '🧹', '⭐', '🎁', '📚', '🧸', '🎮', '🍦', '🍕', '🍰', '🧁', '🏆', '🎉', '❤️'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert('올바른 금액을 입력해 주세요.');
      return;
    }

    addDeposit(
      userRole,
      depositAmount,
      depositCategory,
      depositMessage,
      depositSticker
    );

    // Confetti celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`우리 아이에게 ${Number(depositAmount).toLocaleString()}원을 선물했습니다! 🎁`);
    
    // Reset form
    setDepositAmount('');
    setDepositMessage('');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert('올바른 금액을 입력해 주세요.');
      return;
    }

    if (Number(withdrawAmount) > balance) {
      alert('저금통에 잔액이 부족해요!');
      return;
    }

    addWithdrawal(
      withdrawAmount,
      withdrawMessage,
      'spend',
      withdrawSticker
    );

    showToast(`용돈에서 ${Number(withdrawAmount).toLocaleString()}원을 차감했습니다. 🛒`);

    // Reset form
    setWithdrawAmount('');
    setWithdrawMessage('');
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget || Number(goalTarget) <= 0) {
      alert('올바른 목표 이름과 금액을 입력해 주세요.');
      return;
    }

    addGoal(goalTitle, goalTarget);
    showToast(`새로운 저축 목표 [${goalTitle}] 가 등록되었습니다! 🎯`);

    // Reset form
    setGoalTitle('');
    setGoalTarget('');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const activePin = isFather ? fatherPin : motherPin;

    if (currentPin !== activePin) {
      alert('현재 비밀번호가 맞지 않습니다.');
      return;
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      alert('새 비밀번호는 숫자 6자리여야 합니다.');
      return;
    }

    if (newPin !== confirmPin) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (isFather) {
      updateFatherPin(newPin);
    } else {
      updateMotherPin(newPin);
    }

    showToast('비밀번호가 성공적으로 변경되었습니다! 🔑');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const copyFamilyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleQuickAdd = (value) => {
    setDepositAmount(prev => {
      const current = Number(prev) || 0;
      return String(current + value);
    });
  };

  // Helper to format date
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="parent-dashboard-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notification animate-bounce-gentle">
          <CheckCircle className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={`parent-header-banner ${isFather ? 'father-banner' : 'mother-banner'}`}>
        <div className="banner-details">
          <h2>{parentName}의 지갑 관리실 🛠️</h2>
          <p>아이의 저금통을 채워주고 목표 설정을 도와주세요.</p>
        </div>
        <div className="current-wallet-status">
          <span className="wallet-label">아이 저금통 잔액</span>
          <span className="wallet-amount">{balance.toLocaleString()}원</span>
        </div>
      </div>

      {/* Cloud Database & Pairing Panel */}
      <div className="db-pairing-card">
        <div className="db-status-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3>🛠️ 저금통 연결 정보</h3>
            <span className={`db-status-badge ${dbMode}`}>
              {dbMode === 'cloud' ? '☁️ 클라우드 동기화 활성화 중' : '💾 단독 기기 저장 모드'}
            </span>
          </div>
        </div>

        {dbMode === 'cloud' ? (
          <div>
            <p className="history-subtitle" style={{ marginBottom: '8px' }}>
              다른 기기(아이 태블릿 등)에서 이 저금통을 연동하려면 아래 코드를 입력해 주세요.
            </p>
            <div className="code-display-box">
              <span className="family-code-text">{familyCode}</span>
              <button type="button" onClick={copyFamilyCode} className="btn-copy">
                <span>{isCopied ? '복사됨!' : '코드 복사'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="history-subtitle">
              현재 데이터를 기기 로컬에만 저장 중입니다. 여러 기기에서 동기화하려면 서버 환경 변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)를 입력하여 다시 배포해 주세요.
            </p>
          </div>
        )}

      </div>

      <div className="parent-grid">
        {/* Panel 1: Deposit Form */}
        <div className="form-card deposit-card">
          <h3>💰 용돈 보내기</h3>
          <form onSubmit={handleDepositSubmit}>
            <div className="form-group">
              <label>보낼 금액 (원)</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  placeholder="예: 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                />
                <span className="input-suffix">원</span>
              </div>
              
              <div className="quick-presets">
                <button type="button" onClick={() => handleQuickAdd(1000)}>+1천원</button>
                <button type="button" onClick={() => handleQuickAdd(5000)}>+5천원</button>
                <button type="button" onClick={() => handleQuickAdd(10000)}>+1만원</button>
                <button type="button" onClick={() => handleQuickAdd(50000)}>+5만원</button>
                <button type="button" onClick={() => setDepositAmount('')} className="reset-btn">지우기</button>
              </div>
            </div>

            <div className="form-group">
              <label>카테고리</label>
              <select 
                value={depositCategory} 
                onChange={(e) => setDepositCategory(e.target.value)}
              >
                <option value="pocket_money">정기 용돈 💰</option>
                <option value="chore">심부름 / 집안일 🧹</option>
                <option value="praise">칭찬 보상 ⭐</option>
                <option value="gift">축하 선물 / 특별 보너스 🎁</option>
              </select>
            </div>

            <div className="form-group">
              <label>아이에게 남길 메시지</label>
              <input
                type="text"
                placeholder="예: 방 청소를 아주 깨끗이 했구나! 최고야!"
                value={depositMessage}
                onChange={(e) => setDepositMessage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>스티커 선택</label>
              <div className="sticker-selector">
                {stickers.map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`sticker-option ${depositSticker === st ? 'selected' : ''}`}
                    onClick={() => setDepositSticker(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className={`submit-btn ${isFather ? 'father-btn' : 'mother-btn'}`}>
              <Send size={18} />
              <span>용돈 보내기</span>
            </button>
          </form>
        </div>

        {/* Panel 2: Spend/Withdrawal Form & Goals Management */}
        <div className="parent-side-panels">
          {/* Spend Form */}
          <div className="form-card withdraw-card">
            <h3>🛒 사용한 돈 기록하기 (차감)</h3>
            <form onSubmit={handleWithdrawSubmit}>
              <div className="form-group">
                <label>차감할 금액 (원)</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    placeholder="예: 2000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                  <span className="input-suffix">원</span>
                </div>
              </div>

              <div className="form-group">
                <label>지출 내역</label>
                <input
                  type="text"
                  placeholder="예: 문방구에서 장난감 구매"
                  value={withdrawMessage}
                  onChange={(e) => setWithdrawMessage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>지출 스티커</label>
                <div className="sticker-selector">
                  {['🍦', '🍕', '🎮', '🧸', '🛒', '🍬', '🎬'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`sticker-option ${withdrawSticker === st ? 'selected' : ''}`}
                      onClick={() => setWithdrawSticker(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-btn withdraw-btn">
                <ArrowDownCircle size={18} />
                <span>기록 및 돈 차감</span>
              </button>
            </form>
          </div>

          {/* Goal Management Card */}
          <div className="form-card goal-mgmt-card">
            <h3>🎯 새로운 목표 설정</h3>
            <form onSubmit={handleGoalSubmit}>
              <div className="form-group">
                <label>목표 상품 이름</label>
                <input
                  type="text"
                  placeholder="예: 레고 테크닉 자동차"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>목표 가격 (원)</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    placeholder="예: 45000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                  />
                  <span className="input-suffix">원</span>
                </div>
              </div>

              <button type="submit" className="submit-btn goal-btn">
                <Plus size={18} />
                <span>목표 등록하기</span>
              </button>
            </form>

            {/* Active Goals List */}
            {goals.length > 0 && (
              <div className="active-goals-list-wrapper">
                <h4>현재 설정된 목표 목록</h4>
                <div className="active-goals-list">
                  {goals.map(g => (
                    <div key={g.id} className="parent-goal-item">
                      <div className="parent-goal-info">
                        <span className="parent-goal-title">{g.title}</span>
                        <span className="parent-goal-target">{g.targetAmount.toLocaleString()}원</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (confirm('이 목표를 삭제하시겠습니까?')) deleteGoal(g.id);
                        }}
                        className="delete-icon-btn"
                        title="목표 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Change Passcode Card */}
          <div className="form-card pin-mgmt-card">
            <h3>🔑 {parentName} 비밀번호 변경</h3>
            <form onSubmit={handlePinSubmit}>
              <div className="form-group">
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  placeholder="현재 6자리 비밀번호"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>새 비밀번호 (숫자 6자리)</label>
                <input
                  type="password"
                  placeholder="새 6자리 비밀번호"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>새 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="새 6자리 비밀번호 다시 입력"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <button type="submit" className={`submit-btn ${isFather ? 'father-btn' : 'mother-btn'}`}>
                <span>비밀번호 변경하기</span>
              </button>
            </form>
          </div>

          {/* Danger Zone: Reset Card */}
          <div className="form-card reset-card danger-card">
            <h3>⚠️ 가족 저금통 초기화</h3>
            <p className="reset-warning-text">저금통을 초기화하면 모든 용돈 기록, 저축 목표, 비밀번호가 전부 지워집니다.</p>
            <button 
              type="button" 
              onClick={() => {
                if (confirm('정말로 저금통을 초기화하고 로그아웃하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  resetFamily();
                }
              }}
              className="submit-btn reset-danger-btn"
            >
              <span>초기화 및 로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel 3: Transaction List with Delete Buttons */}
      <div className="parent-history-card">
        <h3>📄 전체 입출금 기록 관리</h3>
        <p className="history-subtitle">잘못 기록된 입출금 건은 삭제(Trash) 버튼을 눌러 수정할 수 있습니다.</p>
        
        {transactions.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="parent-history-table-wrapper desktop-only">
              <table className="parent-history-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>보낸사람/목적</th>
                    <th>내역</th>
                    <th>금액</th>
                    <th>날짜</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className={tx.type === 'deposit' ? 'row-deposit' : 'row-withdraw'}>
                      <td>
                        <span className="tx-sticker-badge">{tx.sticker}</span>
                      </td>
                      <td>
                        <span className="tx-sender-text">
                          {tx.sender === 'father' && '👨 아빠'}
                          {tx.sender === 'mother' && '👩 엄마'}
                          {tx.sender === 'kid' && '👦 아이 (지출)'}
                        </span>
                      </td>
                      <td>{tx.message}</td>
                      <td>
                        <strong className={tx.type === 'deposit' ? 'text-green' : 'text-red'}>
                          {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toLocaleString()}원
                        </strong>
                      </td>
                      <td className="text-gray">{formatDateTime(tx.timestamp)}</td>
                      <td>
                        <button
                          onClick={() => {
                            if (confirm('정말로 이 기록을 삭제하시겠습니까? 잔액이 수정됩니다.')) {
                              deleteTransaction(tx.id);
                              showToast('기록이 정상적으로 지워졌습니다.');
                            }
                          }}
                          className="btn-delete-row"
                          title="기록 삭제"
                        >
                          <Trash2 size={14} />
                          <span>삭제</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="parent-history-cards-wrapper mobile-only">
              {transactions.map(tx => (
                <div key={tx.id} className={`parent-history-card-item ${tx.type === 'deposit' ? 'deposit' : 'withdraw'}`}>
                  <div className="card-item-sticker">{tx.sticker}</div>
                  <div className="card-item-details">
                    <div className="card-item-header">
                      <span className="card-item-sender">
                        {tx.sender === 'father' && '👨 아빠'}
                        {tx.sender === 'mother' && '👩 엄마'}
                        {tx.sender === 'kid' && '👦 아이 (지출)'}
                      </span>
                      <span className="card-item-date">{formatDateTime(tx.timestamp).split(' ')[1] || formatDateTime(tx.timestamp)}</span>
                    </div>
                    <p className="card-item-msg">{tx.message}</p>
                    <div className="card-item-footer">
                      <span className={`card-item-amount ${tx.type === 'deposit' ? 'plus' : 'minus'}`}>
                        {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toLocaleString()}원
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('정말로 이 기록을 삭제하시겠습니까? 잔액이 수정됩니다.')) {
                            deleteTransaction(tx.id);
                            showToast('기록이 정상적으로 지워졌습니다.');
                          }
                        }}
                        className="card-item-delete-btn"
                        title="기록 삭제"
                      >
                        <Trash2 size={12} />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-history-parent">
            입출금 기록이 없습니다.
          </div>
        )}
      </div>

      <style>{`
        .parent-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 0 16px 40px 16px;
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* Toast notification */
        .toast-notification {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 9999;
          font-weight: 600;
          font-size: 0.95rem;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .toast-icon {
          color: #34d399;
        }

        /* Header banner */
        .parent-header-banner {
          color: white;
          padding: 24px;
          border-radius: var(--border-radius-lg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          box-shadow: var(--shadow-md);
          width: 100%;
          box-sizing: border-box;
        }

        .father-banner {
          background: linear-gradient(135deg, var(--father-primary) 0%, #1e40af 100%);
        }

        .mother-banner {
          background: linear-gradient(135deg, var(--mother-primary) 0%, #9d174d 100%);
        }

        .banner-details h2 {
          font-size: 1.4rem;
          margin-bottom: 4px;
        }

        .banner-details p {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .current-wallet-status {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          padding: 12px 20px;
          border-radius: var(--border-radius-md);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: fit-content;
        }

        .wallet-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.8;
          font-weight: 600;
        }

        .wallet-amount {
          font-size: 1.8rem;
          font-weight: 800;
        }

        @media (min-width: 768px) {
          .parent-header-banner {
            flex-direction: row;
            align-items: center;
          }

          .current-wallet-status {
            align-items: flex-end;
          }
        }

        /* Parent Grid Layout */
        .parent-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
          min-width: 0;
        }

        @media (min-width: 768px) {
          .parent-grid {
            grid-template-columns: 1.2fr 1fr;
          }
        }

        /* Card stylings */
        .form-card {
          background: white;
          padding: 24px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid #f1f5f9;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .form-card h3 {
          font-size: 1.15rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 10px;
          color: #1e293b;
        }

        .parent-side-panels {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
        }

        .form-group input, .form-group select {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
          outline: none;
          transition: var(--transition-smooth);
          width: 100%;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #3b82f6;
        }

        .input-with-suffix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-suffix input {
          padding-right: 40px;
        }

        .input-suffix {
          position: absolute;
          right: 14px;
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
        }

        .quick-presets {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .quick-presets button {
          flex: 1;
          min-width: 60px;
          padding: 6px 10px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .quick-presets button:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .quick-presets button.reset-btn {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #e11d48;
        }

        .quick-presets button.reset-btn:hover {
          background: #ffe4e6;
        }

        .sticker-selector {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 2px;
          white-space: nowrap;
          max-width: 100%;
          width: 100%;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }

        .sticker-option {
          font-size: 1.5rem;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-bounce);
          flex-shrink: 0;
        }

        .sticker-option:hover {
          transform: scale(1.15);
        }

        .sticker-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: scale(1.1);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: var(--border-radius-sm);
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-bounce);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .father-btn {
          background: var(--father-primary);
        }
        .father-btn:hover {
          background: #2563eb;
        }

        .mother-btn {
          background: var(--mother-primary);
        }
        .mother-btn:hover {
          background: #db2777;
        }

        .withdraw-btn {
          background: #475569;
        }
        .withdraw-btn:hover {
          background: #334155;
        }

        .goal-btn {
          background: #10b981;
        }
        .goal-btn:hover {
          background: #059669;
        }

        /* Active goals listing */
        .active-goals-list-wrapper {
          margin-top: 20px;
          border-top: 1px dashed #e2e8f0;
          padding-top: 16px;
        }

        .active-goals-list-wrapper h4 {
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 10px;
        }

        .active-goals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .parent-goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--border-radius-sm);
        }

        .parent-goal-info {
          display: flex;
          flex-direction: column;
        }

        .parent-goal-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .parent-goal-target {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .delete-icon-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: var(--transition-smooth);
          padding: 4px;
        }

        .delete-icon-btn:hover {
          color: #ef4444;
        }

        /* History Table styles */
        .parent-history-card {
          background: white;
          padding: 24px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid #f1f5f9;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .parent-history-card h3 {
          font-size: 1.15rem;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .history-subtitle {
          font-size: 0.80rem;
          color: #64748b;
          margin-bottom: 20px;
        }

        .desktop-only {
          display: block;
        }

        .mobile-only {
          display: none;
        }

        .parent-history-table-wrapper {
          overflow-x: auto;
          border-radius: var(--border-radius-sm);
          border: 1px solid #e2e8f0;
        }

        .parent-history-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }

        .parent-history-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 700;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
        }

        .parent-history-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }

        .row-deposit {
          background: #ffffff;
        }

        .row-withdraw {
          background: #fffbfb;
        }

        .tx-sticker-badge {
          font-size: 1.6rem;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 8px;
          display: inline-block;
        }

        .tx-sender-text {
          font-weight: 700;
          color: #1e293b;
        }

        .text-green {
          color: #10b981;
        }

        .text-red {
          color: #ef4444;
        }

        .text-gray {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .btn-delete-row {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-delete-row:hover {
          background: #ffe4e6;
        }

        /* Mobile Card list styling */
        .parent-history-cards-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .parent-history-card-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: var(--border-radius-sm);
          box-shadow: var(--shadow-sm);
        }

        .parent-history-card-item.deposit {
          border-left: 5px solid #10b981;
        }

        .parent-history-card-item.withdraw {
          border-left: 5px solid #ef4444;
          background: #fffbfa;
        }

        .card-item-sticker {
          font-size: 1.8rem;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 8px;
          flex-shrink: 0;
          border: 1px solid #f1f5f9;
        }

        .card-item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .card-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-item-sender {
          font-weight: 700;
          font-size: 0.85rem;
          color: #1e293b;
        }

        .card-item-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .card-item-msg {
          font-size: 0.8rem;
          color: #475569;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .card-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .card-item-amount {
          font-weight: 800;
          font-size: 0.95rem;
        }

        .card-item-amount.plus {
          color: #10b981;
        }

        .card-item-amount.minus {
          color: #ef4444;
        }

        .card-item-delete-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .card-item-delete-btn:hover {
          background: #ffe4e6;
        }

        .empty-history-parent {
          text-align: center;
          padding: 30px;
          color: #94a3b8;
          font-style: italic;
          border: 1px dashed #cbd5e1;
          border-radius: var(--border-radius-sm);
        }

        /* DB Pairing Card styling */
        .db-pairing-card {
          background: white;
          padding: 20px;
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1.5px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .db-pairing-card h3 {
          font-size: 1.05rem;
          color: var(--kid-text);
          font-weight: 700;
        }

        .db-status-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .db-status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .db-status-badge.cloud {
          background: #ecfdf5;
          color: #065f46;
        }

        .db-status-badge.local {
          background: #fef3c7;
          color: #92400e;
        }

        .code-display-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          border: 1px solid #e2e8f0;
          margin-top: 6px;
          width: fit-content;
        }

        .family-code-text {
          font-family: monospace;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--kid-text);
          letter-spacing: 1px;
        }

        .btn-copy {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: var(--father-primary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition-smooth);
        }

        .btn-copy:hover {
          background: #dbeafe;
        }

        .btn-toggle-config {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-toggle-config:hover {
          background: #e2e8f0;
        }

        .sql-schema-area {
          font-family: monospace;
          font-size: 0.75rem;
          background: #0f172a;
          color: #e2e8f0;
          padding: 14px;
          border-radius: 8px;
          width: 100%;
          height: 180px;
          resize: none;
          margin-top: 8px;
          outline: none;
          border: none;
        }

        .danger-card {
          border: 2.5px dashed #f87171 !important;
          background: #fff8f8 !important;
        }

        .reset-warning-text {
          font-size: 0.8rem;
          color: #ef4444;
          margin-bottom: 16px;
          line-height: 1.4;
          font-weight: 600;
        }

        .reset-danger-btn {
          background: #ef4444 !important;
        }

        .reset-danger-btn:hover {
          background: #dc2626 !important;
        }

        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .parent-dashboard-container {
            padding: 0 10px 30px 10px;
          }
          .form-card {
            padding: 16px;
          }
          .quick-presets {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          .quick-presets button {
            min-width: 0;
            width: 100%;
            padding: 8px 4px;
            font-size: 0.75rem;
          }
          .quick-presets button.reset-btn {
            grid-column: span 4;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentDashboard;
