import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"The Writing Room",description:"Writing courses, personal reflections and an author portfolio.",referrer:"no-referrer",icons:{icon:"/favicon.svg"}};
export default function Layout({children}:{children:React.ReactNode}){
  return <html lang="en"><head><link rel="preload" href="/fonts/cormorant.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
    {process.env.GOOGLE_SITE_VERIFICATION && <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION}/>}</head>
    <body><a className="skip" href="#main">Skip to content</a>{children}</body></html>;
}
