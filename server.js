const express = require("express");
const path    = require("path");
const { createClient } = require("@supabase/supabase-js");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));   // 靜態檔案（HTML/CSS/JS/images）

// CORS（給瀏覽器呼叫 /api 時用）
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// ── 共用工具 ──────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getUser(supabase, req) {
  const auth  = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

// ── POST /api/favorites  { recipeId }  → 新增收藏
// ── DELETE /api/favorites { recipeId } → 刪除收藏
// ── GET /api/favorites                 → 取得收藏清單
app.all("/api/favorites", async (req, res) => {
  const supabase = getSupabase();
  const user     = await getUser(supabase, req);
  if (!user) return res.status(401).json({ error: "未登入或 token 無效" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ favorites: data });
  }

  if (req.method === "POST") {
    const { recipeId } = req.body || {};
    if (!recipeId) return res.status(400).json({ error: "recipeId 必填" });
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: user.id, recipe_id: recipeId });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  if (req.method === "DELETE") {
    const { recipeId } = req.body || {};
    if (!recipeId) return res.status(400).json({ error: "recipeId 必填" });
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
});

// ── GET /api/shopping-list              → 取得購物清單
// ── PUT /api/shopping-list { items[] }  → 儲存購物清單
app.all("/api/shopping-list", async (req, res) => {
  const supabase = getSupabase();
  const user     = await getUser(supabase, req);
  if (!user) return res.status(401).json({ error: "未登入或 token 無效" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("items, recipe_id, updated_at")
      .eq("user_id", user.id)
      .single();
    if (error && error.code !== "PGRST116")
      return res.status(500).json({ error: error.message });
    return res.json({ items: data?.items || [], recipe_id: data?.recipe_id || null });
  }

  if (req.method === "PUT") {
    const { items, recipeId } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: "items 必須是陣列" });
    const { error } = await supabase
      .from("shopping_lists")
      .upsert(
        { user_id: user.id, items, recipe_id: recipeId || null, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
});

// SPA fallback — 所有非 API 路徑都回傳 index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`極速食光 server running on port ${PORT}`);
});
