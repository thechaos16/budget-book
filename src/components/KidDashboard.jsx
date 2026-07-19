import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { TrendingUp, Sparkles, Award, Gift, Calendar, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const KidDashboard = () => {
  const { balance, transactions, goals } = useBudget();
  const [clickCount, setClickCount] = useState(0);
  const [floatingCoins, setFloatingCoins] = useState([]);

  // Filter only deposits for the kid's dashboard, or show both with visual separation?
  // Let's show both but color code: green for deposits, orange/red for spending.
  const recentHistory = transactions.slice(0, 10);

  // Selected active goal from localStorage or fallback to latest
  const [activeGoalId, setActiveGoalId] = useState(() => {
    return localStorage.getItem('bb_active_goal_id') || '';
  });

  // Find the active goal object
  let activeGoal = goals.find(g => g.id === activeGoalId);
  // Fallback to first goal if activeGoalId doesn't exist or is not in the goals array
  if (!activeGoal && goals.length > 0) {
    activeGoal = goals[0];
  }

  const handleGoalSelect = (id) => {
    setActiveGoalId(id);
    localStorage.setItem('bb_active_goal_id', id);
    
    // Fun confetti for switching goals!
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const handlePiggyClick = (e) => {
    setClickCount(prev => prev + 1);

    // Create a floating coin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCoin = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setFloatingCoins(prev => [...prev, newCoin]);
    
    // Remove coin after animation ends
    setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 1000);

    // Trigger occasional confetti
    if (clickCount % 5 === 4) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Helper to format date nicely in Korean
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return `${months[date.getMonth()]} ${date.getDate()}일`;
  };

  const getGoalProgress = () => {
    if (!activeGoal) return null;
    const pct = Math.min(Math.round((balance / activeGoal.targetAmount) * 100), 100);
    return pct;
  };

  const progressPercentage = getGoalProgress();

  return (
    <div className="kid-dashboard-container">
      {/* Top Banner Message */}
      <div className="welcome-banner">
        <h2>
          안녕하세요! 👋 <br />
          오늘도 차곡차곡 돈을 모아볼까요?
        </h2>
        <span className="banner-badge">👦 어린이 모드</span>
      </div>

      <div className="dashboard-grid">
        {/* Interactive Piggy Bank Card */}
        <div className="piggy-card card-glow" onClick={handlePiggyClick}>
          <div className="piggy-header">
            <h3>내 저금통 🐖</h3>
            <span className="piggy-hint">저금통을 터치해봐요!</span>
          </div>

          <div className="piggy-visual-wrapper">
            <div className="piggy-icon-container animate-bounce-gentle">
              <span className="piggy-emoji">🐷</span>
              <div className="coin-slot"></div>
            </div>
            {floatingCoins.map(coin => (
              <span 
                key={coin.id} 
                className="floating-coin"
                style={{ left: `${coin.x}px`, top: `${coin.y}px` }}
              >
                🪙
              </span>
            ))}
          </div>

          <div className="balance-display">
            <span className="balance-label">모은 돈</span>
            <h1 className="balance-amount">{balance.toLocaleString()}원</h1>
          </div>
        </div>

        {/* Savings Goal Tracker */}
        <div className="goal-card">
          <div className="card-header">
            <h3>나의 저축 목표 🎯</h3>
            <Sparkles className="icon-gold animate-pulse-gold" />
          </div>

          {activeGoal ? (
            <div className="goal-content">
              <div className="goal-title-wrapper">
                <span className="goal-sticker">🎁</span>
                <div>
                  <h4 className="goal-title">{activeGoal.title}</h4>
                  <span className="goal-price">목표 금액: {activeGoal.targetAmount.toLocaleString()}원</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="progress-labels">
                  <span>{progressPercentage}% 완료</span>
                  <span>{balance.toLocaleString()}원 / {activeGoal.targetAmount.toLocaleString()}원</span>
                </div>
              </div>

              {balance >= activeGoal.targetAmount ? (
                <div className="goal-success-box animate-pulse-gold">
                  <Award className="success-icon" />
                  <p>우와! 목표를 달성했어요! 🥳 아빠 엄마에게 말해서 선물을 받으세요!</p>
                </div>
              ) : (
                <p className="goal-motivation-text">
                  목표 달성까지 <strong>{(activeGoal.targetAmount - balance).toLocaleString()}원</strong> 남았어요! 화이팅! 💪
                </p>
              )}

              {/* Goal List for selection */}
              {goals.length > 1 && (
                <div className="goal-selector-section">
                  <h5 className="goal-selector-title">다른 목표 선택하기 🎯</h5>
                  <div className="goal-selector-list">
                    {goals.map(g => {
                      const isSelected = g.id === activeGoal.id;
                      const gProgress = Math.min(Math.round((balance / g.targetAmount) * 100), 100);
                      return (
                        <button
                          key={g.id}
                          className={`goal-selector-item ${isSelected ? 'active' : ''}`}
                          onClick={() => handleGoalSelect(g.id)}
                          type="button"
                        >
                          <div className="selector-item-content">
                            <span className="selector-item-title">
                              {isSelected ? '⭐ ' : ''}{g.title}
                            </span>
                            <span className="selector-item-progress">{gProgress}% 완료</span>
                          </div>
                          <div className="selector-progress-bar-bg">
                            <div 
                              className="selector-progress-bar-fill"
                              style={{ width: `${gProgress}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-goal">
              <p>아직 등록된 목표가 없어요. 아빠 엄마와 함께 목표를 등록해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* History Log */}
      <div className="history-section">
        <h3 className="section-title">최근 내 지갑 내역 📝</h3>
        {recentHistory.length > 0 ? (
          <div className="history-list">
            {recentHistory.map((tx) => (
              <div 
                key={tx.id} 
                className={`history-item bounce-hover ${tx.type === 'deposit' ? 'type-deposit' : 'type-withdraw'}`}
              >
                <div className="item-sticker">{tx.sticker}</div>
                <div className="item-details">
                  <div className="item-header-row">
                    <span className="item-sender">
                      {tx.sender === 'father' && '👨 아빠가 주신 돈'}
                      {tx.sender === 'mother' && '👩 엄마가 주신 돈'}
                      {tx.sender === 'kid' && '👦 내가 쓴 돈'}
                    </span>
                    <span className="item-date">
                      <Calendar className="date-icon" />
                      {formatDate(tx.timestamp)}
                    </span>
                  </div>
                  <p className="item-message">{tx.message}</p>
                </div>
                <div className="item-amount-wrapper">
                  <span className={`item-amount ${tx.type === 'deposit' ? 'plus' : 'minus'}`}>
                    {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history">
            <p>아직 기록이 없어요. 아빠 엄마가 용돈을 주시면 여기에 나타나요!</p>
          </div>
        )}
      </div>

      <style>{`
        .kid-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 0 16px 40px 16px;
          max-width: 900px;
          margin: 0 auto;
        }

        .welcome-banner {
          background: linear-gradient(135deg, var(--kid-primary) 0%, #ff8e53 100%);
          color: white;
          padding: 24px;
          border-radius: var(--border-radius-lg);
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .welcome-banner h2 {
          font-size: 1.4rem;
          line-height: 1.4;
          z-index: 2;
          position: relative;
        }

        .banner-badge {
          display: inline-block;
          margin-top: 12px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(4px);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Piggy Bank Card */
        .piggy-card {
          background: var(--kid-card-bg);
          border: 3px solid var(--kid-border);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: pointer;
          user-select: none;
          box-shadow: var(--shadow-md);
          transition: var(--transition-bounce);
        }

        .piggy-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .piggy-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .piggy-hint {
          font-size: 0.75rem;
          color: var(--kid-text-light);
          background: #ffeef2;
          padding: 2px 8px;
          border-radius: 12px;
          display: inline-block;
          margin-top: 4px;
          font-weight: 600;
        }

        .piggy-visual-wrapper {
          position: relative;
          width: 100%;
          height: 150px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .piggy-icon-container {
          position: relative;
          font-size: 5.5rem;
        }

        .coin-slot {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 5px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 2px;
        }

        .floating-coin {
          position: absolute;
          font-size: 2.2rem;
          pointer-events: none;
          animation: floatUp 0.8s forwards cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }

        @keyframes floatUp {
          0% {
            transform: translate(-50%, -50%) scale(0.5) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3) translateY(-100px);
            opacity: 0;
          }
        }

        .balance-display {
          text-align: center;
          margin-top: 16px;
        }

        .balance-label {
          font-size: 0.9rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .balance-amount {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--kid-primary);
          margin-top: 4px;
          letter-spacing: -0.5px;
        }

        /* Goal Card */
        .goal-card {
          background: white;
          border: 3px solid #e0f2fe;
          border-radius: var(--border-radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #f0f9ff;
          padding-bottom: 12px;
        }

        .icon-gold {
          color: var(--kid-secondary);
        }

        .goal-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex-grow: 1;
        }

        .goal-title-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .goal-sticker {
          font-size: 2.5rem;
          background: #fffbeb;
          padding: 8px;
          border-radius: var(--border-radius-md);
          border: 2px solid #fef3c7;
        }

        .goal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--kid-text);
        }

        .goal-price {
          font-size: 0.85rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .progress-section {
          margin-top: 8px;
        }

        .progress-bar-bg {
          height: 16px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--kid-secondary) 0%, #10b981 100%);
          border-radius: 10px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--kid-text-light);
          margin-top: 6px;
        }

        .goal-success-box {
          background: #ecfdf5;
          border: 2px solid #34d399;
          border-radius: var(--border-radius-md);
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #065f46;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .success-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        .goal-motivation-text {
          font-size: 0.85rem;
          color: var(--kid-text-light);
          text-align: center;
        }

        .empty-goal {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-grow: 1;
          min-height: 120px;
          text-align: center;
          color: var(--kid-text-light);
          font-size: 0.9rem;
          border: 2px dashed #e2e8f0;
          border-radius: var(--border-radius-md);
          padding: 20px;
        }

        /* History Section */
        .history-section {
          margin-top: 12px;
        }

        .section-title {
          font-size: 1.2rem;
          margin-bottom: 16px;
          color: var(--kid-text);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: var(--border-radius-md);
          border: 2px solid transparent;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }

        .history-item.type-deposit {
          border-left: 6px solid var(--kid-success);
          border-color: transparent transparent transparent var(--kid-success);
        }

        .history-item.type-withdraw {
          border-left: 6px solid #fb7185;
          border-color: transparent transparent transparent #fb7185;
        }

        .history-item:hover {
          transform: scale(1.01) translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .item-sticker {
          font-size: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: #f8fafc;
          border-radius: var(--border-radius-sm);
          border: 1px solid #f1f5f9;
        }

        .item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .item-sender {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--kid-text);
        }

        .item-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .date-icon {
          width: 12px;
          height: 12px;
        }

        .item-message {
          font-size: 0.85rem;
          color: var(--kid-text-light);
        }

        .item-amount-wrapper {
          text-align: right;
        }

        .item-amount {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .item-amount.plus {
          color: var(--kid-success);
        }

        .item-amount.minus {
          color: #fb7185;
        }

        /* Goal Selector Styles */
        .goal-selector-section {
          margin-top: 16px;
          border-top: 2px dashed #f0f9ff;
          padding-top: 16px;
        }

        .goal-selector-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--kid-text);
          margin-bottom: 10px;
        }

        .goal-selector-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 180px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .goal-selector-list::-webkit-scrollbar {
          width: 6px;
        }
        .goal-selector-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .goal-selector-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .goal-selector-item {
          width: 100%;
          text-align: left;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: var(--border-radius-sm);
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .goal-selector-item:hover {
          background: #f0fdf4;
          border-color: #bbf7d0;
          transform: translateY(-1px);
        }

        .goal-selector-item.active {
          background: #fffbeb;
          border-color: var(--kid-secondary);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
        }

        .selector-item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selector-item-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--kid-text);
        }

        .goal-selector-item.active .selector-item-title {
          color: #b45309;
        }

        .selector-item-progress {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--kid-text-light);
        }

        .goal-selector-item.active .selector-item-progress {
          color: #d97706;
        }

        .selector-progress-bar-bg {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          width: 100%;
        }

        .goal-selector-item.active .selector-progress-bar-bg {
          background: #fef3c7;
        }

        .selector-progress-bar-fill {
          height: 100%;
          background: #94a3b8;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        .goal-selector-item:hover .selector-progress-bar-fill {
          background: #4ade80;
        }

        .goal-selector-item.active .selector-progress-bar-fill {
          background: linear-gradient(90deg, var(--kid-secondary) 0%, #10b981 100%);
        }

        .empty-history {
          text-align: center;
          padding: 40px;
          color: var(--kid-text-light);
          background: rgba(255,255,255,0.5);
          border-radius: var(--border-radius-md);
          border: 2px dashed #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default KidDashboard;
