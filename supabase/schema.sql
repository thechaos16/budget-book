-- 1. 가족 테이블 생성
create table bb_families (
  id text primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 사용자 계정 테이블 생성 (아빠, 엄마, 아이)
create table bb_users (
  id text primary key, -- 형식: familyId_role (예: FAM-123_father)
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
