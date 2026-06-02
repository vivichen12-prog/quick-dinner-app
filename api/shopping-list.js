// GET /api/shopping-list              → 取得使用者購物清單
// PUT /api/shopping-list { items[] }  → 儲存 / 更新購物清單
const { createClient } = require("@supabase/supabase-js");

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getUser(supabase, req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabase = getSupabase();
  const user = await getUser(supabase, req);
  if (!user) return res.status(401).json({ error: "未登入或 token 無效" });

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("items, recipe_id, updated_at")
      .eq("user_id", user.id)
      .single();
    // PGRST116 = no rows found, return empty list
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
};
