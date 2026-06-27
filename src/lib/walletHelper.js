export async function resolveOrCreateProfileId(supabase, identifier, email = "") {
  if (!identifier) return null;

  // 1. Check by primary key id = identifier
  const { data: resId } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", identifier)
    .maybeSingle();

  if (resId?.id) return resId.id;

  // 2. Check by user_id = identifier
  try {
    const { data: resUserId } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", identifier)
      .maybeSingle();

    if (resUserId?.id) return resUserId.id;
  } catch (e) {
    // user_id column might not exist or error out
  }

  // 3. Check by email
  if (email && email.trim()) {
    const { data: resEmail } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email.trim())
      .maybeSingle();

    if (resEmail?.id) return resEmail.id;
  }

  // 4. Auto-provision a skeleton profile if missing in profiles table
  const defaultUsername = `user_${identifier.substring(0, 5)}`;
  const { data: inserted, error: insertErr } = await supabase
    .from("profiles")
    .insert({
      id: identifier,
      user_id: identifier,
      email: email && email.trim() ? email.trim() : `${identifier}@xmytravel-user.com`,
      username: defaultUsername,
      status: "approved",
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (insertErr) {
    console.warn("Could not auto-provision skeleton profile:", insertErr.message);
  }

  return inserted?.id || identifier;
}
