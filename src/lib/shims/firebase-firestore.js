import { supabase } from "../supabase";

export class Timestamp {
  constructor(seconds, nanoseconds) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() {
    const ms = Date.now();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }
  static fromDate(date) {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }
  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
}

export function orderBy(field, direction) {
  return { type: "orderBy", field, direction };
}

export function limit(val) {
  return { type: "limit", value: val };
}

const mapTableName = (name) => {
  if (!name) return "";
  const lower = name.toLowerCase();
  if (lower === "profiles") return "profiles";
  if (lower === "questions") return "questions";
  if (lower === "joinqueries") return "join_queries";
  return lower;
};

const mapFieldName = (field) => {
  if (field === "fullName") return "full_name";
  if (field === "profileType") return "profile_type";
  if (field === "isPublic") return "is_public";
  if (field === "createdAt") return "created_at";
  if (field === "updatedAt") return "updated_at";
  return field;
};

class DocumentSnapshot {
  constructor(id, dataExists, data = {}) {
    this.id = id;
    this.exists = () => dataExists;
    this._data = data;
  }
  data() {
    return this._data;
  }
}

class QuerySnapshot {
  constructor(docs = []) {
    this.docs = docs;
  }
  forEach(callback) {
    this.docs.forEach(callback);
  }
}

export function getFirestore() {
  return {};
}

export function collection(db, path) {
  return { type: "collection", path: mapTableName(path) };
}

export function doc(dbOrCollection, pathOrId, maybeId) {
  let path = "";
  let id = "";
  if (typeof dbOrCollection === "object" && dbOrCollection.type === "collection") {
    path = dbOrCollection.path;
    id = pathOrId;
  } else {
    path = mapTableName(pathOrId);
    id = maybeId;
  }
  return { type: "doc", path, id };
}

export function where(field, op, value) {
  return { type: "where", field: mapFieldName(field), op, value };
}

export function query(ref, ...constraints) {
  return { type: "query", ref, constraints };
}

export async function getDoc(docRef) {
  const { data, error } = await supabase
    .from(docRef.path)
    .select("*")
    .eq("id", docRef.id)
    .maybeSingle();

  if (error || !data) {
    return new DocumentSnapshot(docRef.id, false);
  }
  return new DocumentSnapshot(docRef.id, true, data);
}

export async function getDocs(queryRef) {
  let tableName = "";
  let constraints = [];

  if (queryRef.type === "collection") {
    tableName = queryRef.path;
  } else if (queryRef.type === "query") {
    tableName = queryRef.ref.path;
    constraints = queryRef.constraints || [];
  }

  let dbQuery = supabase.from(tableName).select("*");

  for (const c of constraints) {
    if (c.type === "where") {
      if (c.op === "==") {
        dbQuery = dbQuery.eq(c.field, c.value);
      } else if (c.op === ">") {
        dbQuery = dbQuery.gt(c.field, c.value);
      } else if (c.op === "<") {
        dbQuery = dbQuery.lt(c.field, c.value);
      }
    }
  }

  const { data, error } = await dbQuery;
  if (error || !data) {
    return new QuerySnapshot([]);
  }

  const docs = data.map((row) => new DocumentSnapshot(row.id, true, row));
  return new QuerySnapshot(docs);
}

export async function addDoc(collectionRef, data) {
  const { data: inserted, error } = await supabase
    .from(collectionRef.path)
    .insert(data)
    .select("id")
    .single();

  if (error) throw error;
  return { id: inserted.id };
}

export async function setDoc(docRef, data, options = {}) {
  const { error } = await supabase
    .from(docRef.path)
    .upsert({ id: docRef.id, ...data });

  if (error) throw error;
}

export async function updateDoc(docRef, data) {
  const { error } = await supabase
    .from(docRef.path)
    .update(data)
    .eq("id", docRef.id);

  if (error) throw error;
}

export async function deleteDoc(docRef) {
  const { error } = await supabase
    .from(docRef.path)
    .delete()
    .eq("id", docRef.id);

  if (error) throw error;
}

export function onSnapshot(queryRef, callback) {
  // Mock realtime update subscription
  let active = true;
  const poll = async () => {
    if (!active) return;
    try {
      const snap = await getDocs(queryRef);
      callback(snap);
    } catch (e) {
      console.error("onSnapshot polling error:", e);
    }
    setTimeout(poll, 5000);
  };
  poll();
  return () => {
    active = false;
  };
}

export function writeBatch() {
  return {
    set: () => {},
    update: () => {},
    commit: async () => {},
  };
}

export async function getCountFromServer() {
  return {
    data: () => ({ count: 0 }),
  };
}

export function increment(val) {
  return val;
}

