// Supabase Edge Function "notify": called by a database trigger whenever an item is added.
// Sends a push notification to every phone that turned notifications on, except the one that added it.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

webpush.setVapidDetails(
  "https://thedredgegroup.github.io/While-your-out/",
  Deno.env.get("VAPID_PUBLIC")!,
  Deno.env.get("VAPID_PRIVATE")!,
);

Deno.serve(async (req) => {
  if (req.headers.get("x-notify-secret") !== Deno.env.get("NOTIFY_SECRET")) {
    return new Response("unauthorized", { status: 401 });
  }
  const { record } = await req.json();

  let query = db.from("push_subs").select("endpoint, subscription");
  if (record?.device_id) query = query.neq("device_id", record.device_id);
  const { data: subs, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const payload = JSON.stringify({ title: "Added to the list", body: record?.name || "Something new" });

  const results = await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification(s.subscription, payload, { TTL: 60 * 60 * 24 });
      return "sent";
    } catch (e) {
      // 404/410 = that phone turned notifications off or uninstalled; forget it.
      if (e.statusCode === 404 || e.statusCode === 410) {
        await db.from("push_subs").delete().eq("endpoint", s.endpoint);
        return "removed";
      }
      return `failed ${e.statusCode ?? ""} ${e.body ?? e.message}`;
    }
  }));

  return Response.json({ results });
});
