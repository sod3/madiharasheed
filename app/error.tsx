"use client";
export default function ErrorPage({reset}:{reset:()=>void}) {
  return <main id="main" className="reading section stack"><h1>This page is temporarily unavailable</h1><p>Please try loading it again.</p><div className="actions"><button className="button" onClick={reset}>Try again</button><a className="button outline" href="/">Back to Home</a></div></main>;
}
