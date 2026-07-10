import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BudgetContext = createContext();

const INITIAL_TRANSACTIONS = [
  {
    id: 't-1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(),
    sender: 'mother',
    type: 'deposit',
    amount: 5000,
    category: 'chore',
    message: '방 청소 도와줘서 고마워! 🧹',
    sticker: '🧹'
  },
  {
    id: 't-2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sender: 'father',
    type: 'deposit',
    amount: 10000,
    category: 'praise',
    message: '책 한 권 다 읽은 기념! 📚✨',
    sticker: '📚'
  },
  {
    id: 't-3',
    timestamp: new Date().toISOString(),
    sender: 'kid',
    type: 'withdraw',
    amount: 2000,
    category: 'spend',
    message: '달콤한 아이스크림 사 먹기 🍦',
    sticker: '🍦'
  }
];

const INITIAL_GOALS = [
  {
    id: 'g-1',
    title: '레고 스타워즈 세트 🛸',
    targetAmount: 50000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SQL_SCHEMA = `-- 1. 가족 테이블 생성
create table bb_families (
  id text primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 사용자 계정 테이블 생성 (아빠, 엄마, 아이)
create table bb_users (
  id text primary key, -- 형식: familyId_role
  family_id text references bb_families(id) on delete cascade not null,
  role text not null, -- 'father' | 'mother' | 'kid'
  name text not null, -- '아빠', '엄마', '아이'
  pin text, -- 아빠, 엄마의 6자리 PIN 번호
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 입출금 내역 테이블 생성
create table bb_transactions (
  id text primary key,
  family_id text references bb_families(id) on delete cascade not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  sender text not null,
  type text not null,
  amount numeric not null,
  category text not null,
  message text,
  sticker text
);

-- 4. 저축 목표 테이블 생성
create table bb_goals (
  id text primary key,
  family_id text references bb_families(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. 실시간 동기화(Realtime) 활성화
alter publication supabase_realtime add table bb_transactions, bb_goals, bb_users, bb_families;
`;

export const BudgetProvider = ({ children }) => {
  const dbClient = supabase;
  const dbMode = dbClient ? 'cloud' : 'local';

  // Config States
  const [isRegistered, setIsRegistered] = useState(() => {
    return localStorage.getItem('bb_is_registered') === 'true';
  });

  const [familyName, setFamilyName] = useState(() => {
    return localStorage.getItem('bb_family_name') || '';
  });

  const [familyCode, setFamilyCode] = useState(() => {
    return localStorage.getItem('bb_family_code') || '';
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('bb_user_role') || 'kid';
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('bb_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('bb_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [fatherPin, setFatherPin] = useState(() => {
    return localStorage.getItem('bb_father_pin') || '111111';
  });

  const [motherPin, setMotherPin] = useState(() => {
    return localStorage.getItem('bb_mother_pin') || '222222';
  });

  // Calculate balance dynamically
  const balance = transactions.reduce((acc, curr) => {
    return curr.type === 'deposit' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  // Sync basic configurations to localStorage
  useEffect(() => {
    localStorage.setItem('bb_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('bb_is_registered', String(isRegistered));
  }, [isRegistered]);

  useEffect(() => {
    localStorage.setItem('bb_family_name', familyName);
  }, [familyName]);

  useEffect(() => {
    localStorage.setItem('bb_family_code', familyCode);
  }, [familyCode]);

  useEffect(() => {
    localStorage.setItem('bb_father_pin', fatherPin);
  }, [fatherPin]);

  useEffect(() => {
    localStorage.setItem('bb_mother_pin', motherPin);
  }, [motherPin]);

  // Sync transaction lists to local storage
  useEffect(() => {
    localStorage.setItem('bb_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bb_goals', JSON.stringify(goals));
  }, [goals]);

  // Load Cloud Data when Cloud Mode starts
  useEffect(() => {
    if (dbMode !== 'cloud' || !familyCode) return;

    const loadCloudData = async () => {
      // 1. Fetch Family Row
      const { data: family, error: fErr } = await dbClient
        .from('bb_families')
        .select('*')
        .eq('id', familyCode)
        .single();

      if (!fErr && family) {
        setFamilyName(family.name);
        setIsRegistered(true);
      }

      // 2. Fetch Users to get passcodes
      const { data: users, error: uErr } = await dbClient
        .from('bb_users')
        .select('*')
        .eq('family_id', familyCode);

      if (!uErr && users) {
        const father = users.find(u => u.role === 'father');
        const mother = users.find(u => u.role === 'mother');
        if (father) setFatherPin(father.pin);
        if (mother) setMotherPin(mother.pin);
      }

      // 3. Fetch Transactions
      const { data: txs, error: tErr } = await dbClient
        .from('bb_transactions')
        .select('*')
        .eq('family_id', familyCode)
        .order('timestamp', { ascending: false });

      if (!tErr && txs) {
        const formatted = txs.map(tx => ({ ...tx, amount: Number(tx.amount) }));
        setTransactions(formatted);
      }

      // 4. Fetch Goals
      const { data: gls, error: gErr } = await dbClient
        .from('bb_goals')
        .select('*')
        .eq('family_id', familyCode)
        .order('created_at', { ascending: false });

      if (!gErr && gls) {
        const formatted = gls.map(g => ({ ...g, targetAmount: Number(g.target_amount) }));
        setGoals(formatted);
      }
    };

    loadCloudData();
  }, [dbMode, dbClient, familyCode]);

  // Real-Time Listener Setup (Sync between devices)
  useEffect(() => {
    if (dbMode !== 'cloud' || !familyCode) return;

    const txChannel = dbClient
      .channel('bb_transactions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bb_transactions', filter: `family_id=eq.${familyCode}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTx = { ...payload.new, amount: Number(payload.new.amount) };
            setTransactions(prev => {
              if (prev.some(tx => tx.id === newTx.id)) return prev;
              return [newTx, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(tx => tx.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const goalChannel = dbClient
      .channel('bb_goals_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bb_goals', filter: `family_id=eq.${familyCode}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newGoal = { ...payload.new, targetAmount: Number(payload.new.target_amount) };
            setGoals(prev => {
              if (prev.some(g => g.id === newGoal.id)) return prev;
              return [newGoal, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setGoals(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Also listen to users table to sync pin changes in realtime
    const userChannel = dbClient
      .channel('bb_users_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bb_users', filter: `family_id=eq.${familyCode}` },
        (payload) => {
          if (payload.new.role === 'father') {
            setFatherPin(payload.new.pin);
          } else if (payload.new.role === 'mother') {
            setMotherPin(payload.new.pin);
          }
        }
      )
      .subscribe();

    return () => {
      dbClient.removeChannel(txChannel);
      dbClient.removeChannel(goalChannel);
      dbClient.removeChannel(userChannel);
    };
  }, [dbMode, dbClient, familyCode]);

  // Actions
  const addDeposit = async (sender, amount, category, message, sticker) => {
    const txId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const defaultMsg = getCategoryDefaultMessage(category);
    const defaultStk = getCategoryDefaultSticker(category);

    const newTx = {
      id: txId,
      timestamp,
      sender,
      type: 'deposit',
      amount: Number(amount),
      category,
      message: message || defaultMsg,
      sticker: sticker || defaultStk
    };

    setTransactions(prev => [newTx, ...prev]);

    if (dbMode === 'cloud') {
      await dbClient.from('bb_transactions').insert({
        id: txId,
        family_id: familyCode,
        timestamp,
        sender,
        type: 'deposit',
        amount: Number(amount),
        category,
        message: message || defaultMsg,
        sticker: sticker || defaultStk
      });
    }
  };

  const addWithdrawal = async (amount, message, category = 'spend', sticker = '🛒') => {
    const txId = `t-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTx = {
      id: txId,
      timestamp,
      sender: 'kid',
      type: 'withdraw',
      amount: Number(amount),
      category,
      message: message || '용돈 쓰기',
      sticker: sticker || '🛒'
    };

    setTransactions(prev => [newTx, ...prev]);

    if (dbMode === 'cloud') {
      await dbClient.from('bb_transactions').insert({
        id: txId,
        family_id: familyCode,
        timestamp,
        sender: 'kid',
        type: 'withdraw',
        amount: Number(amount),
        category,
        message: message || '용돈 쓰기',
        sticker: sticker || '🛒'
      });
    }
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));

    if (dbMode === 'cloud') {
      await dbClient.from('bb_transactions').delete().eq('id', id);
    }
  };

  const addGoal = async (title, targetAmount) => {
    const goalId = `g-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const newGoal = {
      id: goalId,
      title,
      targetAmount: Number(targetAmount),
      createdAt
    };

    setGoals(prev => [newGoal, ...prev]);

    if (dbMode === 'cloud') {
      await dbClient.from('bb_goals').insert({
        id: goalId,
        family_id: familyCode,
        title,
        target_amount: Number(targetAmount),
        created_at: createdAt
      });
    }
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));

    if (dbMode === 'cloud') {
      await dbClient.from('bb_goals').delete().eq('id', id);
    }
  };

  const updateFatherPin = async (newPin) => {
    setFatherPin(newPin);
    if (dbMode === 'cloud') {
      await dbClient
        .from('bb_users')
        .update({ pin: newPin })
        .eq('family_id', familyCode)
        .eq('role', 'father');
    }
  };

  const updateMotherPin = async (newPin) => {
    setMotherPin(newPin);
    if (dbMode === 'cloud') {
      await dbClient
        .from('bb_users')
        .update({ pin: newPin })
        .eq('family_id', familyCode)
        .eq('role', 'mother');
    }
  };

  // Setup / Register Family Account
  const registerFamily = async (name, dadPin, momPin) => {
    if (dbMode === 'cloud') {
      // Create random 8-character unique family code
      const code = `FAM-${Math.random().toString(36).substring(2, 7).toUpperCase()}${Math.floor(Math.random() * 10)}`;
      
      const { error: fErr } = await dbClient.from('bb_families').insert({
        id: code,
        name
      });

      if (fErr) {
        alert('데이터베이스 연결 실패: ' + fErr.message);
        return;
      }

      // Insert three user account rows
      const { error: uErr } = await dbClient.from('bb_users').insert([
        { id: `${code}_father`, family_id: code, role: 'father', name: '아빠', pin: dadPin },
        { id: `${code}_mother`, family_id: code, role: 'mother', name: '엄마', pin: momPin },
        { id: `${code}_kid`, family_id: code, role: 'kid', name: '아이', pin: null }
      ]);

      if (uErr) {
        alert('사용자 계정 생성 실패: ' + uErr.message);
        // Rollback family insert
        await dbClient.from('bb_families').delete().eq('id', code);
        return;
      }
      
      setFamilyCode(code);
    } else {
      setFamilyCode('LOCAL-MODE');
    }
    
    setFamilyName(name);
    setFatherPin(dadPin);
    setMotherPin(momPin);
    setIsRegistered(true);
  };

  // Pair existing family (Multi-device)
  const connectFamily = async (code) => {
    if (dbMode !== 'cloud') {
      alert('클라우드 데이터베이스가 연결되어 있어야 합니다.');
      return false;
    }

    try {
      const { data: family, error: fErr } = await dbClient
        .from('bb_families')
        .select('*')
        .eq('id', code)
        .single();

      if (fErr || !family) {
        alert('올바르지 않은 가족 코드입니다.');
        return false;
      }

      const { data: users, error: uErr } = await dbClient
        .from('bb_users')
        .select('*')
        .eq('family_id', code);

      if (uErr || !users) {
        alert('사용자 정보를 가져올 수 없습니다.');
        return false;
      }

      const father = users.find(u => u.role === 'father');
      const mother = users.find(u => u.role === 'mother');

      setFamilyCode(family.id);
      setFamilyName(family.name);
      if (father) setFatherPin(father.pin);
      if (mother) setMotherPin(mother.pin);
      setIsRegistered(true);
      return true;
    } catch (err) {
      alert('연결 에러: ' + err.message);
      return false;
    }
  };

  const resetFamily = () => {
    localStorage.clear();
    setIsRegistered(false);
    setFamilyName('');
    setFamilyCode('');
    setFatherPin('111111');
    setMotherPin('222222');
    setTransactions(INITIAL_TRANSACTIONS);
    setGoals(INITIAL_GOALS);
    setUserRole('kid');
  };

  const getCategoryDefaultMessage = (cat) => {
    switch (cat) {
      case 'chore': return '심부름 완료!';
      case 'praise': return '칭찬 듬뿍!';
      case 'pocket_money': return '정기 용돈!';
      case 'gift': return '축하 선물!';
      default: return '용돈 받았어요!';
    }
  };

  const getCategoryDefaultSticker = (cat) => {
    switch (cat) {
      case 'chore': return '🧹';
      case 'praise': return '⭐';
      case 'pocket_money': return '💰';
      case 'gift': return '🎁';
      default: return '🪙';
    }
  };

  return (
    <BudgetContext.Provider value={{
      userRole,
      setUserRole,
      balance,
      transactions,
      goals,
      fatherPin,
      motherPin,
      isRegistered,
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
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
