"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { sendDiscordTestMessage } from "@/actions/admin/discord/test-webhook";
import { Button } from "@/components/ui/button";

export function DiscordToolsClient({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    const result = await sendDiscordTestMessage();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Test message sent to Discord");
  }

  return (
    <Button
      type="button"
      disabled={disabled || loading}
      className="bg-[#5865f2] text-white hover:bg-[#4752c4]"
      onClick={handleTest}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" data-icon="inline-start" />
          Send test message
        </>
      )}
    </Button>
  );
}
