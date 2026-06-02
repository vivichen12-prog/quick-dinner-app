-- ============================================================
-- 極速食光 — Supabase 資料庫結構
-- 在 Supabase > SQL Editor 貼上並執行此腳本
-- ============================================================

-- 收藏食譜表
CREATE TABLE IF NOT EXISTS favorites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 購物清單表（每位使用者一筆，upsert 更新）
CREATE TABLE IF NOT EXISTS shopping_lists (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id   TEXT,
  items       JSONB DEFAULT '[]',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE favorites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists  ENABLE ROW LEVEL SECURITY;

-- 使用者只能讀寫自己的收藏
CREATE POLICY "own_favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- 使用者只能讀寫自己的購物清單
CREATE POLICY "own_shopping_list" ON shopping_lists
  FOR ALL USING (auth.uid() = user_id);

-- ── 索引 ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_favorites_user    ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_user     ON shopping_lists(user_id);
