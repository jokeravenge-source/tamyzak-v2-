import { useState } from "react";
import { HandHeart, Headphones, Mic, MicOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setStudyRoomMic, type useStudyRoomActivity } from "@/hooks/useStudyRoomActivity";
import { useStudyRoomVoice } from "@/hooks/useStudyRoomVoice";
import { studyRoomActivityRpc } from "@/lib/studyRoomActivityRpc";
import { censorText } from "@/lib/censor";

const copy = {
  ar: {
    encourage: "شجّع", sent: "وصل تشجيعك", cooldown: "تمهّل شوي قبل ما ترسل تشجيع ثاني",
    encouragement: "شجّعك تكمّل دراستك", dismiss: "إخفاء الإشعارات",
    voice: "صوت الغرفة", request: "اطلب فتح المايك", pending: "طلبك بانتظار صاحب الغرفة",
    declined: "صاحب الغرفة ما سمح بفتح المايك", open: "شغّل المايك", mute: "سكّر المايك",
    approved: "صاحب الغرفة وافق. تگدر تشغّل المايك.", requests: "طلبات المايك",
    allow: "سماح", deny: "رفض", revoke: "إلغاء السماح", micOn: "المايك شغّال",
    listen: "اسمع", stop: "أوقف الاستماع", connecting: "جاري الاتصال…", play: "شغّل الصوت",
    unavailable: "خيارات الصوت مو متاحة حالياً", error: "ما تم الإجراء. جرّب مرة ثانية.",
    connection: "ما اتصل صوت الغرفة. جرّب مرة ثانية.", microphone: "اسمح باستخدام المايك من إعدادات المتصفح.",
    busy: "المايك مفتوح لطالب ثاني حالياً.",
  },
  en: {
    encourage: "Cheer", sent: "Cheer sent", cooldown: "Wait a moment before sending another cheer",
    encouragement: "cheered you on", dismiss: "Dismiss notifications",
    voice: "Room audio", request: "Request mic", pending: "Waiting for the room owner",
    declined: "The room owner did not grant mic access", open: "Turn on mic", mute: "Turn off mic",
    approved: "The room owner approved your mic. You can turn it on now.", requests: "Mic requests",
    allow: "Allow", deny: "Decline", revoke: "Revoke access", micOn: "Mic is on",
    listen: "Listen", stop: "Stop listening", connecting: "Connecting…", play: "Play audio",
    unavailable: "Room audio is temporarily unavailable", error: "That didn’t go through. Try again.",
    connection: "Couldn’t connect to room audio. Try again.", microphone: "Allow microphone access in your browser settings.",
    busy: "A student is already using the mic.",
  },
} as const;

type Language = keyof typeof copy;

export function EncourageStudyRoomMember({ room, user, name, language }: {
  room: string;
  user: string;
  name: string;
  language: Language;
}) {
  const [busy, setBusy] = useState(false);
  const t = copy[language];
  const send = async () => {
    setBusy(true);
    try {
      const { error } = await studyRoomActivityRpc("encourage_study_room_member", { _room: room, _recipient: user });
      if (error) throw error;
      toast.success(t.sent);
    } catch (error) {
      toast.error((error as { message?: string })?.message === "ENCOURAGEMENT_COOLDOWN" ? t.cooldown : t.error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void send()}
      aria-label={`${t.encourage} ${name}`} className="mt-1 h-8 gap-1 px-2 text-xs text-primary">
      <HandHeart aria-hidden className="size-3.5" />{t.encourage}
    </Button>
  );
}

export default function StudyRoomActivity({ room, user, members, language, activity }: {
  room: string;
  user: string;
  members: string;
  language: Language;
  activity: ReturnType<typeof useStudyRoomActivity>;
}) {
  const { data, failed, refresh, voiceReady, voiceListener } = activity;
  const t = copy[language];
  const speaker = failed ? null : data?.speaker ?? null;
  const voice = useStudyRoomVoice({ room, speaker, members, ready: voiceReady && !failed, signal: voiceListener, refresh });
  const [busy, setBusy] = useState(false);

  const actOnMic = async (action: "request" | "approve" | "decline" | "revoke", requester?: string) => {
    setBusy(true);
    try {
      await setStudyRoomMic(room, action, requester);
    } catch {
      toast.error(t.error);
    } finally {
      await refresh();
      setBusy(false);
    }
  };

  const dismiss = async () => {
    const through = data?.inbox[0]?.created_at;
    if (!through) return;
    const { error } = await studyRoomActivityRpc("dismiss_study_room_encouragements", { _room: room, _through: through });
    if (error) toast.error(t.error);
    else await refresh();
  };

  if (!data || failed) return null;
  const canSpeak = data.owner || data.mic === "approved";
  const otherSpeaker = speaker && speaker.user_id !== user;
  return (
    <div className="mb-4 space-y-2">
      {data.inbox.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm">
          <HandHeart aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <ul className="min-w-0 flex-1 space-y-1">
            {data.inbox.map(({ sender_id, sender_name, created_at, reward_points = 0 }) => (
              <li key={`${sender_id}:${created_at}`} className="break-words">
                <bdi className="font-semibold">{censorText(sender_name)}</bdi> {t.encouragement}
                {reward_points > 0 && (
                  <span className="ms-2 whitespace-nowrap font-bold text-primary"><bdi dir="ltr">+{reward_points}</bdi> {language === "ar" ? "نقاط" : "points"}</span>
                )}
              </li>
            ))}
          </ul>
          <Button type="button" variant="ghost" size="icon" className="-m-1 size-8 shrink-0" aria-label={t.dismiss} onClick={() => void dismiss()}>
            <X aria-hidden className="size-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-primary/20 bg-background/60 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="me-auto flex items-center gap-2 text-sm font-semibold">
            <Mic aria-hidden className="size-4 text-primary" />{t.voice}
          </h3>
          {speaker && !voice.speaking && <bdi className="max-w-full truncate text-xs text-muted-foreground">{censorText(speaker.name)} · {t.micOn}</bdi>}
          {otherSpeaker && (voice.listening ? (
            <Button type="button" size="sm" variant="outline" onClick={voice.stopListening}>
              {voice.listening === "connecting" ? `${t.connecting} ${t.stop}` : t.stop}
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => void voice.listen()}>
              <Headphones aria-hidden className="size-4" />{t.listen}
            </Button>
          ))}
          {voice.needsPlay && <Button type="button" size="sm" onClick={voice.playAudio}>{t.play}</Button>}
          {voice.speaking ? (
            <Button type="button" size="sm" variant="outline" onClick={voice.stopMic}>
              <MicOff aria-hidden className="size-4" />{t.mute}
            </Button>
          ) : canSpeak ? (
            <Button type="button" size="sm" disabled={!!speaker || voice.opening || !!voice.listening} onClick={() => void voice.startMic()}>
              {voice.opening ? t.connecting : t.open}
            </Button>
          ) : data.mic !== "pending" && data.mic !== "live" && (
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void actOnMic("request")}>{t.request}</Button>
          )}
        </div>
        <div aria-live="polite" className="space-y-1 text-xs text-muted-foreground empty:hidden">
          {data.mic === "pending" && !data.owner && <p>{t.pending}</p>}
          {data.mic === "declined" && <p>{t.declined}</p>}
          {data.mic === "approved" && !data.owner && <p>{t.approved}</p>}
          {voice.error && <p className="text-destructive">{t[voice.error]}</p>}
        </div>
        {data.owner && data.requests.length > 0 && (
          <div className="space-y-1 border-t border-border pt-2">
            <h4 className="text-xs font-semibold">{t.requests}</h4>
            <ul className="space-y-1">
              {data.requests.map((request) => (
                <li key={request.user_id} className="flex flex-wrap items-center gap-1.5">
                  <bdi className="me-auto max-w-full truncate text-sm">{censorText(request.name)}</bdi>
                  {request.state === "pending" ? (
                    <>
                      <Button type="button" size="sm" disabled={busy} onClick={() => void actOnMic("approve", request.user_id)}>{t.allow}</Button>
                      <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void actOnMic("decline", request.user_id)}>{t.deny}</Button>
                    </>
                  ) : (
                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void actOnMic("revoke", request.user_id)}>{t.revoke}</Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <audio ref={voice.audio} />
      </div>
    </div>
  );
}
