import { createSupabaseAdminClient } from "../supabaseAdmin";

class AdminAuth {
  async getUserByEmail(email) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    const user = data.users.find(u => u.email === email);
    if (!user) {
      const err = new Error("User not found");
      err.code = "auth/user-not-found";
      throw err;
    }
    return { uid: user.id, email: user.email };
  }

  async getUser(uid) {
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.getUserById(uid);
    if (error || !user) {
      const err = new Error("User not found");
      err.code = "auth/user-not-found";
      throw err;
    }
    return { uid: user.id, email: user.email };
  }

  async createUser(properties) {
    const supabase = createSupabaseAdminClient();
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: properties.email,
      password: properties.password,
      email_confirm: true,
      user_metadata: { name: properties.displayName }
    });
    if (error) throw error;
    return { uid: user.id, email: user.email };
  }

  async generatePasswordResetLink(email) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://xmytravel.com/expert-reset-password"
      }
    });
    if (error) throw error;
    return data.properties.action_link;
  }
}

class AdminDb {
  collection(name) {
    return {
      doc: (id) => ({
        get: async () => {
          const supabase = createSupabaseAdminClient();
          const { data, error } = await supabase.from(name.toLowerCase()).select("*").eq("id", id).maybeSingle();
          return {
            exists: !error && !!data,
            data: () => data
          };
        },
        set: async (data) => {
          const supabase = createSupabaseAdminClient();
          const { error } = await supabase.from(name.toLowerCase()).upsert({ id, ...data });
          if (error) throw error;
        },
        delete: async () => {
          const supabase = createSupabaseAdminClient();
          const { error } = await supabase.from(name.toLowerCase()).delete().eq("id", id);
          if (error) throw error;
        }
      })
    };
  }
}

const authInstance = new AdminAuth();
const dbInstance = new AdminDb();

export function getAuth() {
  return authInstance;
}

export function initializeApp() {
  return {};
}

export function getApps() {
  return [{}];
}

export function cert() {
  return {};
}

export function getFirestore() {
  return dbInstance;
}

const adminMock = {
  auth: getAuth,
  firestore: () => dbInstance,
  apps: [{}],
  initializeApp: () => ({})
};

export default adminMock;
