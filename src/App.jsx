import React, { useState, useEffect } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import Navbar from './components/Navbar';
import KidDashboard from './components/KidDashboard';
import ParentDashboard from './components/ParentDashboard';
import PinEntryModal from './components/PinEntryModal';
import RegisterPage from './components/RegisterPage';

function BudgetAppContent() {
  const { userRole, setUserRole, isRegistered } = useBudget();
  const [pendingRole, setPendingRole] = useState(null);

  // Sync body theme class with user role
  useEffect(() => {
    if (!isRegistered) {
      document.body.className = '';
      return;
    }
    // Remove existing themes
    document.body.classList.remove('theme-kid', 'theme-father', 'theme-mother');
    // Add active theme
    document.body.classList.add(`theme-${userRole}`);
  }, [userRole, isRegistered]);

  if (!isRegistered) {
    return <RegisterPage />;
  }

  return (
    <div className="app-layout">
      <Navbar onRequestRoleChange={setPendingRole} />
      
      <main className="main-content">
        {userRole === 'kid' ? (
          <KidDashboard />
        ) : (
          <ParentDashboard />
        )}
      </main>

      {pendingRole && (
        <PinEntryModal
          role={pendingRole}
          onSuccess={() => {
            setUserRole(pendingRole);
            setPendingRole(null);
          }}
          onClose={() => setPendingRole(null)}
        />
      )}
      
      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          width: 100%;
          margin: 0 auto;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <BudgetProvider>
      <BudgetAppContent />
    </BudgetProvider>
  );
}

export default App;
