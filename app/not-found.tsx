import Link from "next/link";
import {Heading} from "@/components/editorial";
export default function NotFound(){
  return <main id="main"><Heading title="Page not found" description="This page may have moved or may still be in preparation."><div className="actions downloads"><Link className="button" href="/">Back to Home</Link><Link className="button outline" href="/courses">Browse Courses</Link></div></Heading></main>;
}
