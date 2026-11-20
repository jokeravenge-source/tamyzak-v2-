export default function PodcastSpeakingText({
  text,
  phrase,
  offset,
}: {
  text: string;
  phrase: string;
  offset?: number;
}) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const start = phrase
    ? offset !== undefined &&
      normalized.slice(offset, offset + phrase.length) === phrase
      ? offset
      : normalized.indexOf(phrase)
    : -1;
  if (start < 0) return <>{text}</>;
  return (
    <>
      {normalized.slice(0, start)}
      <strong
        className="rounded bg-cyan-300/15 font-black text-cyan-100"
        aria-current="true"
      >
        {normalized.slice(start, start + phrase.length)}
      </strong>
      {normalized.slice(start + phrase.length)}
    </>
  );
}
