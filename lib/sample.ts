import type { Row } from "@/db";
import { images } from "./domain";
export const exampleCourses:Row[]=[
  {id:-1,demo:true,featured:1,title:"The Art of the Personal Essay",slug:"the-art-of-personal-essay",category:"Creative Writing",image:images.craft,alt:"An open notebook, a thin book, and a cup on a sunlit writing desk",
  duration:"4 weeks",format:"Live online",availability:"Coming soon",summary:"Turn a moment from your life into a personal essay with a clear shape and a voice of its own.",
  body:"Start with a memory you can still see clearly. Choose one scene, identify the question it raises, and find a shape for the story you want to tell. The last session is devoted to reading aloud and revision.",
  audience:"Curious beginners\nWriters returning to a draft\nAnyone who wants to write from lived experience",
  outcomes:"Write a scene grounded in specific detail\nBuild a narrative around a meaningful question\nRevise a complete short personal essay",
  requirements:"Bring a notebook or a laptop and a memory you are comfortable writing about.",
  faq:"Do I need writing experience?|The exercises start with a single memory and build from there.\nWhat will I finish?|A revised short essay and a reusable revision process."},
  {id:-2,demo:true,featured:1,title:"Finding Your Writing Voice",slug:"finding-your-writing-voice",category:"Storytelling",image:images.notes,alt:"An amethyst fountain pen and manuscript pages",
  duration:"3 sessions",format:"Self-paced",availability:"Coming soon",summary:"Explore rhythm, detail, and point of view to make your writing sound more like you.",
  body:"Voice develops through the choices you make on the page. Use short experiments with sentence length, concrete detail, and point of view to notice those choices and make them more deliberate.",
  outcomes:"Recognize the habits that shape your writing\nRewrite one scene from different perspectives\nCreate an editing checklist"},
  {id:-3,demo:true,featured:1,title:"Write With Clarity",slug:"write-with-clarity",category:"Professional Development",image:images.hero,alt:"Hands turning a notebook page by a window",
  duration:"2 hours",format:"In-person workshop",availability:"Coming soon",summary:"Give emails, reports, and proposals a structure that helps busy readers find what matters.",
  body:"Bring a professional writing sample. Work through a sequence of edits that clarifies its purpose, structure, and language.",
  outcomes:"Lead with the decision or action\nWrite headings readers can scan\nEdit for direct, precise language"},
];
export const exampleModules:Record<number,{title:string;body:string}[]>={
  [-1]:[{title:"Choose a moment",body:"Collect promising memories, choose a manageable scene, and identify the question you want to explore."},
  {title:"Build the scene",body:"Use sensory detail, dialogue, and pacing to give your reader a place to stand."},
  {title:"Find the shape",body:"Make a beginning, middle, and ending that serve the question at the heart of the essay."},
  {title:"Revise aloud",body:"Use rhythm and specificity to guide a final edit."}],
  [-2]:[{title:"Listen to your sentences",body:"Compare rhythm and sentence length in a draft."},{title:"Change the point of view",body:"Compare what two perspectives notice in the same scene."}],
  [-3]:[{title:"Begin with the reader",body:"Identify the decision or action that the document should support."},{title:"Revise for clarity",body:"Move essential information to a place the reader can find quickly."}],
};
export const exampleArticles:Row[]=[
  {id:-1,demo:true,featured:1,language:"en",title:"The practice of paying attention",slug:"the-practice-of-paying-attention",category:"Personal Reflections",image:images.notes,alt:"A pen on cream paper in soft shadow",
  summary:"A small writing practice for noticing the details that make an ordinary day worth remembering.",
  body:"Just before the tea is ready, there is a change in sound. The kettle moves from a low rush to a note you can hear in the next room. The next time you sit down to write, you could mention that the water boiled. Or you could keep the sound.\n\n## Keep one detail\n\nAt the end of the day, write down one thing that might otherwise disappear: an overheard sentence, the smell of rain on warm pavement, the repair someone made to a favorite book. Give the detail a sentence of its own.\n\nAfter a week you have small pieces of actual life to work with. When a draft feels vague, open those notes and find a detail the reader can hear or see."},
  {id:-2,demo:true,language:"en",title:"What a first draft is for",slug:"what-a-first-draft-is-for",category:"Writing & Creativity",image:images.craft,alt:"Books and a notebook on an old study table",
  summary:"A way to begin when the idea feels clear in your head and elusive on the page.",
  body:"A first draft gives you something to respond to. Write one sentence about what you hope the reader will see, then follow it with the scene or detail that brought the idea to mind.\n\n## Begin where the energy is\n\nIf you keep rewriting the opening, start with the part you are eager to describe. When you return to the draft you can decide where that part belongs. Leave yourself a little room to be surprised."},
  {id:-3,demo:true,language:"ur",title:"روز چند سطریں",slug:"a-few-lines-every-day",category:"Writing & Creativity",image:images.hero,alt:"کھلی نوٹ بک اور قلم",
  summary:"لکھنے کی عادت بنانے کے لیے روز ایک چھوٹا سا مشاہدہ کافی ہے۔",
  body:"دن کے آخر میں چند منٹ نکالیں اور کوئی ایک منظر لکھیں جو آپ کو یاد رہ گیا ہو۔ یہ کھڑکی سے آتی روشنی، کسی بچے کا سوال یا چائے کی خوشبو ہو سکتی ہے۔\n\n## ایک منظر، چند سطریں\n\nکوشش کریں کہ منظر کی وہ بات لکھیں جو صرف آپ نے دیکھی ہو۔ ایک ہفتے بعد ان سطروں کو دوبارہ پڑھیں۔ شاید ان میں کسی کہانی کا پہلا جملہ موجود ہو۔"},
];
export const exampleGallery:Row[]=[
  {id:-1,demo:true,title:"At the writing desk",image:images.hero,alt:"An open notebook by a window",category:"Editorial imagery"},
  {id:-2,demo:true,title:"A place to begin",image:images.craft,alt:"Books and a cup beside a notebook",category:"Editorial imagery"},
  {id:-3,demo:true,title:"Notes in the margin",image:images.notes,alt:"A fountain pen and manuscript pages",category:"Editorial imagery"},
];
