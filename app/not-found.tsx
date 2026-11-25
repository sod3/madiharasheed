import {Heading} from "@/components/editorial";
export default function NotFound(){
  return <main id="main"><Heading title="Page not found" description="This page may have moved or may still be in preparation."><div className="actions downloads"><a className="button" href="/">Back to Home</a><a className="button outline" href="/courses">Browse Courses</a></div></Heading></main>;
}
