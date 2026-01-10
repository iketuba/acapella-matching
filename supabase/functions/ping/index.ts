import { serve } from "https://deno.land/std/http/server.ts";

serve(() => {
  return new Response("pong", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
