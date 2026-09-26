import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Sparkles, Award, Calendar, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const KidDashboard = () => {
  const { balance, transactions, goals, toggleGoalDone } = useBudget();
  const [clickCount, setClickCount] = useState(0);
  const [floatingCoins, setFloatingCoins] = useState([]);

  // Filter only deposits for the kid's dashboard, or show both with visual separation?
  // Let's show both but color code: green for deposits, orange/red for spending.
  const recentHistory = transactions.slice(0, 10);

  // Selected active goal from localStorage or fallback to latest
  const [activeGoalId, setActiveGoalId] = useState(() => {
    return localStorage.getItem('bb_active_goal_id') || '';
  });

  // Only display undone goals on the active tracker
  const undoneGoals = goals.filter(g => !g.isDone && !g.completedAt);
  // Completed goals for the Hall of Fame
  const completedGoals = goals.filter(g => g.isDone || g.completedAt);

  // Find the active goal object among undone goals
  let activeGoal = undoneGoals.find(g => g.id === activeGoalId);
  // Fallback to first undone goal if activeGoalId doesn't exist or is not in the undone goals array
  if (!activeGoal && undoneGoals.length > 0) {
    activeGoal = undoneGoals[0];
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

  const formatFameDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
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
                  <div className="goal-success-top">
                    <Award className="success-icon" />
                    <div>
                      <p className="goal-success-main">우와! 목표를 달성했어요! 🥳</p>
                      <p className="goal-success-sub">아빠 엄마에게 알리고 명예의 전당에 올려보세요!</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="goal-complete-btn bounce-hover"
                    onClick={() => {
                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#ffd700', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
                      });
                      toggleGoalDone(activeGoal.id, true);
                    }}
                  >
                    🏆 명예의 전당에 등록하기!
                  </button>
                </div>
              ) : (
                <p className="goal-motivation-text">
                  목표 달성까지 <strong>{(activeGoal.targetAmount - balance).toLocaleString()}원</strong> 남았어요! 화이팅! 💪
                </p>
              )}

              {/* Goal List for selection */}
              {undoneGoals.length > 1 && (
                <div className="goal-selector-section">
                  <h5 className="goal-selector-title">다른 목표 선택하기 🎯</h5>
                  <div className="goal-selector-list">
                    {undoneGoals.map(g => {
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

      {/* Hall of Fame / Completed Goals Block */}
      <div className="hall-of-fame-section">
        <div className="hall-of-fame-header">
          <div className="hall-of-fame-title-group">
            <span className="hall-of-fame-trophy-emoji">🏆</span>
            <div>
              <h3 className="hall-of-fame-title">명예의 전당 (Hall of Fame)</h3>
              <p className="hall-of-fame-desc">차곡차곡 저축해서 이뤄낸 멋진 꿈들이에요!</p>
            </div>
          </div>
          {completedGoals.length > 0 && (
            <div className="hall-of-fame-badge">
              <span>총 {completedGoals.length}개 달성</span>
              <Sparkles size={14} className="sparkle-gold" />
            </div>
          )}
        </div>

        {completedGoals.length > 0 ? (
          <div className="hall-of-fame-grid">
            {completedGoals.map((g, idx) => (
              <div
                key={g.id}
                className="fame-card"
                onClick={() => {
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#ffd700', '#f59e0b', '#ff6b6b', '#48bb78', '#4299e1']
                  });
                }}
                title="카드를 눌러 축하 폭죽을 터뜨려보세요! 🎉"
              >
                <div className="fame-card-crown">
                  {idx === 0 ? '👑' : idx === 1 ? '⭐' : '✨'}
                </div>
                <div className="fame-card-badge-row">
                  <span className="fame-card-rank">
                    {idx === 0 ? '🥇 1호 목표' : idx === 1 ? '🥈 2호 목표' : idx === 2 ? '🥉 3호 목표' : `🎖️ ${idx + 1}호 목표`}
                  </span>
                  <span className="fame-card-done-tag">달성 완료!</span>
                </div>
                
                <div className="fame-card-body">
                  <div className="fame-icon-box">
                    <Trophy className="fame-icon-svg" />
                  </div>
                  <div className="fame-card-text">
                    <h4 className="fame-title">{g.title}</h4>
                    <p className="fame-target-amount">{g.targetAmount.toLocaleString()}원 저축 성공 🎉</p>
                  </div>
                </div>

                <div className="fame-card-footer">
                  <span className="fame-date-text">
                    <Calendar size={13} />
                    {g.completedAt ? formatFameDate(g.completedAt) : '달성 완료'}
                  </span>
                  <button
                    type="button"
                    className="fame-confetti-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      confetti({
                        particleCount: 60,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#ffd700', '#f59e0b', '#3b82f6', '#ec4899']
                      });
                    }}
                  >
                    🎊 팡파레
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fame-empty-state">
            <div className="fame-empty-icon">🏆</div>
            <h4>아직 명예의 전당이 비어있어요</h4>
            <p>
              목표 금액을 끝까지 모아서 명예의 전당에 첫 번째 황금 트로피를 세워보세요! 🌟
            </p>
          </div>
        )}
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

        /* Success Box Enhancements */
        .goal-success-box {
          background: #ecfdf5;
          border: 2px solid #34d399;
          border-radius: var(--border-radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #065f46;
        }

        .goal-success-top {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .goal-success-main {
          font-size: 0.95rem;
          font-weight: 800;
          color: #065f46;
          margin: 0;
        }

        .goal-success-sub {
          font-size: 0.8rem;
          color: #047857;
          margin: 2px 0 0 0;
          font-weight: 600;
        }

        .goal-complete-btn {
          align-self: flex-start;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .goal-complete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(217, 119, 6, 0.4);
        }

        /* Hall of Fame Section */
        .hall-of-fame-section {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fffdf5 100%);
          border: 3px solid #fde68a;
          border-radius: var(--border-radius-lg);
          padding: 24px;
          box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.15), 0 8px 10px -6px rgba(245, 158, 11, 0.1);
          position: relative;
          overflow: hidden;
        }

        .hall-of-fame-section::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .hall-of-fame-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .hall-of-fame-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hall-of-fame-trophy-emoji {
          font-size: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          border: 2px solid #fde68a;
          animation: gentleFloat 3s ease-in-out infinite alternate;
        }

        @keyframes gentleFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-4px); }
        }

        .hall-of-fame-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #92400e;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .hall-of-fame-desc {
          font-size: 0.82rem;
          color: #b45309;
          margin: 3px 0 0 0;
          font-weight: 600;
        }

        .hall-of-fame-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f59e0b;
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 800;
          box-shadow: 0 3px 8px rgba(245, 158, 11, 0.35);
        }

        .sparkle-gold {
          color: #fef08a;
        }

        .hall-of-fame-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 640px) {
          .hall-of-fame-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        .fame-card {
          background: white;
          border: 2px solid #fef08a;
          border-radius: var(--border-radius-md);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .fame-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(217, 119, 6, 0.18);
          border-color: #f59e0b;
        }

        .fame-card-crown {
          position: absolute;
          top: -6px;
          right: 12px;
          font-size: 1.5rem;
          pointer-events: none;
          opacity: 0.85;
          transform: rotate(15deg);
        }

        .fame-card-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 24px;
        }

        .fame-card-rank {
          font-size: 0.78rem;
          font-weight: 800;
          color: #b45309;
          background: #fef3c7;
          padding: 3px 8px;
          border-radius: 8px;
        }

        .fame-card-done-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #059669;
          background: #d1fae5;
          padding: 3px 8px;
          border-radius: 8px;
        }

        .fame-card-body {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fame-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fef08a 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
          flex-shrink: 0;
        }

        .fame-icon-svg {
          width: 22px;
          height: 22px;
          color: white;
        }

        .fame-card-text {
          flex: 1;
          min-width: 0;
        }

        .fame-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--kid-text);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fame-target-amount {
          font-size: 0.82rem;
          font-weight: 700;
          color: #d97706;
          margin: 2px 0 0 0;
        }

        .fame-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
          border-top: 1px dashed #fde68a;
          margin-top: 2px;
        }

        .fame-date-text {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--kid-text-light);
          font-weight: 600;
        }

        .fame-confetti-btn {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fame-confetti-btn:hover {
          background: #f59e0b;
          color: white;
          transform: scale(1.05);
        }

        .fame-empty-state {
          text-align: center;
          padding: 32px 16px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(4px);
          border-radius: var(--border-radius-md);
          border: 2px dashed #fde68a;
        }

        .fame-empty-icon {
          font-size: 2.8rem;
          margin-bottom: 8px;
          filter: grayscale(0.2) drop-shadow(0 4px 8px rgba(245, 158, 11, 0.2));
        }

        .fame-empty-state h4 {
          font-size: 1.05rem;
          color: #92400e;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .fame-empty-state p {
          font-size: 0.85rem;
          color: #b45309;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default KidDashboard;
