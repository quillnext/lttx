import { supabase } from "../supabase";

class AuthShim {
  constructor() {
    this.currentUser = null;
    // Set initial user if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        this.currentUser = {
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.name || user.email,
          emailVerified: true,
          getIdTokenResult: async () => ({
            claims: {
              admin: user.user_metadata?.role === 'admin' || user.email === 'quillnext2024@gmail.com' || user.email === 'priyanshu.vermaa0@gmail.com',
            }
          })
        };
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      this.currentUser = user ? {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.name || user.email,
        emailVerified: true,
        getIdTokenResult: async () => ({
          claims: {
            admin: user.user_metadata?.role === 'admin' || user.email === 'quillnext2024@gmail.com' || user.email === 'priyanshu.vermaa0@gmail.com',
          }
        })
      } : null;
    });
  }
}

const authInstance = new AuthShim();

export function getAuth() {
  return authInstance;
}

export async function signInWithEmailAndPassword(auth, email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = data.user;
  const shimmedUser = {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.name || user.email,
    emailVerified: true,
    getIdTokenResult: async () => ({
      claims: {
        admin: user.user_metadata?.role === 'admin' || user.email === 'quillnext2024@gmail.com' || user.email === 'priyanshu.vermaa0@gmail.com',
      }
    })
  };
  auth.currentUser = shimmedUser;
  return { user: shimmedUser };
}

export async function signOut(auth) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  auth.currentUser = null;
}

export function onAuthStateChanged(auth, callback) {
  callback(auth.currentUser);
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user || null;
    const shimmedUser = user ? {
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.name || user.email,
      emailVerified: true,
      getIdTokenResult: async () => ({
        claims: {
          admin: user.user_metadata?.role === 'admin' || user.email === 'quillnext2024@gmail.com' || user.email === 'priyanshu.vermaa0@gmail.com',
        }
      })
    } : null;
    auth.currentUser = shimmedUser;
    callback(shimmedUser);
  });
  return () => subscription.unsubscribe();
}

export class GoogleAuthProvider {}
export async function signInWithPopup() {
  return supabase.auth.signInWithOAuth({ provider: 'google' });
}

export class EmailAuthProvider {
  static credential(email, password) {
    return { email, password };
  }
}

export async function reauthenticateWithCredential(user, credential) {
  return {};
}

export async function updatePassword(user, newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function verifyPasswordResetCode(auth, code) {
  return ""; 
}

export async function confirmPasswordReset(auth, code, newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
