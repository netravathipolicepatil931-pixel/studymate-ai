import { supabase, isSupabaseConfigured } from "./supabase";

export async function fetchSessionsFromDb() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: sessionData, error: sessionErr } = await supabase
      .from("study_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (sessionErr) throw sessionErr;

    const { data: messageData, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (msgErr) throw msgErr;

    return sessionData.map((session) => ({
      id: session.id,
      title: session.title,
      messages: messageData
        .filter((msg) => msg.session_id === session.id)
        .map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          attachedFile: msg.attached_file,
          studyPack: msg.study_pack,
        })),
    }));
  } catch (err) {
    console.warn("Supabase fetch error, using local fallback:", err);
    return null;
  }
}

export async function createSessionInDb(title = "New Study Session") {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert([{ title }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.warn("Supabase create session error:", err);
    return null;
  }
}

export async function deleteSessionInDb(sessionId) {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from("study_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Supabase delete session error:", err);
    return false;
  }
}

export async function saveMessageInDb(sessionId, message) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          session_id: sessionId,
          sender: message.sender,
          text: message.text,
          attached_file: message.attachedFile || null,
          study_pack: message.studyPack || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (err) {
    console.warn("Supabase save message error:", err);
    return null;
  }
}

export async function updateSessionTitleInDb(sessionId, title) {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from("study_sessions")
      .update({ title })
      .eq("id", sessionId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Supabase update session title error:", err);
    return false;
  }
}
