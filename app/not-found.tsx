import Link from "next/link";
import { Heading } from "@/components/editorial";
import { Brand } from "@/components/navigation";
import { defaults } from "@/lib/domain";

export default function NotFound() {
  return (
    <main id="main" className="fallback-page" tabIndex={-1}>
      <div className="fallback-brand"><div className="shell"><Brand title={defaults.site_title} /></div></div>
      <Heading title="Page not found." description="This page may have moved or is no longer published." motif="orbits">
        <div className="actions downloads"><Link prefetch={false} className="button" href="/">Return home</Link><Link prefetch={false} className="button outline" href="/contact">Get in touch</Link></div>
      </Heading>
    </main>
  );
}
