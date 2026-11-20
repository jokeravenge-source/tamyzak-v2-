type SpeechOptions = { purpose?: unknown; voice?: unknown; speed?: unknown };

export function speechSettings({ purpose, voice, speed }: SpeechOptions) {
  if (purpose === "podcast") {
    return {
      voice: "fable",
      speed: 1,
      instructions:
        "تحدث باللهجة العراقية الطبيعية بصوت رجالي دافئ وواضح كمدرس ودود يراجع ويا طالب. نبرة مشجعة وخفيفة دم من دون مبالغة. اقرأ النص كما هو، مع وقفات قصيرة بين الأفكار، وتمهّل عند القوانين والأرقام والمصطلحات العلمية. لا تضف كلمات أو ضحكات من عندك.",
    };
  }
  return {
    voice: typeof voice === "string" && voice ? voice : "alloy",
    speed:
      typeof speed === "number" && speed >= 0.25 && speed <= 4 ? speed : 1.25,
  };
}
