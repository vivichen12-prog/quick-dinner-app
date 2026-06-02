// POST /api/favorites  { recipeId }   → add favorite
// DELETE /api/favorites { recipeId }  → remove favorite
// GET /api/favorites                  → list user's favorites
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
};
