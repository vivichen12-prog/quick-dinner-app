const express      = require("express");
const path         = require("path");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// ── 共用工具 ──────────────────────────────────────────────────
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// 從 httpOnly cookie 取得目前登入的使用者
async function getUser(supabase, req) {
  const token = req.cookies?.sb_token;
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   true,
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000   // 7 天
};

// ── POST /api/auth/login { email, password } ─────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "信箱與密碼必填" });

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  res.cookie("sb_token", data.session.access_token, COOKIE_OPTS);
  return res.json({
    user: {
      id:    data.user.id,
      email: data.user.email,
      name:  data.user.user_metadata?.display_name || data.user.email.split("@")[0]
    }
  });
});

// ── POST /api/auth/register { email, password, name } ────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "信箱與密碼必填" });
  if (password.length < 6)  return res.status(400).json({ error: "密碼至少 6 個字元" });

  const supabase = getSupabase();
  const { error } = await supabase.auth.signUp({
    email, password,
    options: { data: { display_name: name || email.split("@")[0] } }
  });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ success: true });
});

// ── POST /api/auth/logout ─────────────────────────────────────
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("sb_token");
  return res.json({ success: true });
});

// ── GET /api/auth/me — 檢查目前 session ──────────────────────
app.get("/api/auth/me", async (req, res) => {
  const supabase = getSupabase();
  const user = await getUser(supabase, req);
  if (!user) return res.json({ user: null });
  return res.json({
    user: {
      id:    user.id,
      email: user.email,
      name:  user.user_metadata?.display_name || user.email.split("@")[0]
    }
  });
});

// ── GET/POST/DELETE /api/favorites ───────────────────────────
app.all("/api/favorites", async (req, res) => {
  const supabase = getSupabase();
  const user     = await getUser(supabase, req);
  if (!user) return res.status(401).json({ error: "請先登入" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("favorites").select("recipe_id, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ favorites: data });
  }
  if (req.method === "POST") {
    const { recipeId } = req.body || {};
    if (!recipeId) return res.status(400).json({ error: "recipeId 必填" });
    const { error } = await supabase.from("favorites")
      .upsert({ user_id: user.id, recipe_id: recipeId });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  if (req.method === "DELETE") {
    const { recipeId } = req.body || {};
    if (!recipeId) return res.status(400).json({ error: "recipeId 必填" });
    const { error } = await supabase.from("favorites").delete()
      .eq("user_id", user.id).eq("recipe_id", recipeId);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  res.status(405).json({ error: "Method not allowed" });
});

// ── GET/PUT /api/shopping-list ────────────────────────────────
app.all("/api/shopping-list", async (req, res) => {
  const supabase = getSupabase();
  const user     = await getUser(supabase, req);
  if (!user) return res.status(401).json({ error: "請先登入" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("shopping_lists").select("items, recipe_id, updated_at")
      .eq("user_id", user.id).single();
    if (error && error.code !== "PGRST116")
      return res.status(500).json({ error: error.message });
    return res.json({ items: data?.items || [], recipe_id: data?.recipe_id || null });
  }
  if (req.method === "PUT") {
    const { items, recipeId } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: "items 必須是陣列" });
    const { error } = await supabase.from("shopping_lists").upsert(
      { user_id: user.id, items, recipe_id: recipeId || null, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }
  res.status(405).json({ error: "Method not allowed" });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`極速食光 server running on port ${PORT}`);
});
