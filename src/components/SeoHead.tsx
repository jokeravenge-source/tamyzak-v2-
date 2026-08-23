import { Helmet } from "react-helmet-async";

const SITE_URL = "https://tamyazak.site";

type SeoHeadProps = {
  title: string;
  description: string;
  /** Path of the current route, e.g. "/flashcards". */
  path: string;
  noindex?: boolean;
};

/** Per-route title / description / canonical / Open Graph tags. */
const SeoHead = ({ title, description, path, noindex }: SeoHeadProps) => {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
    </Helmet>
  );
};

export default SeoHead;
