(function(){
"use strict";
var W = typeof window !== "undefined" ? window : {};
var DOC = typeof document !== "undefined" ? document : null;
var state = {settings:{}};
var PATH = "/";
var root = null;
var ADMIN = "/admin";
var canEdit = false, editMode = false, menuOpen = false;
function setState(st){ state = st || {settings:{}}; Object.keys(C).forEach(function(k){ if (!Array.isArray(state[k])) state[k] = []; }); if (!state.external) state.external = {}; if (!state.settings) state.settings = {}; }
var ui = {spotKind:"All", spotPeriod:"All", spotCat:"All", evTab:"upcoming", mgr:"news", resDept:"All", oppType:"All", acTab:"announcements"};
var LIMIT = 14 * 1024 * 1024;
var MOTION = !(W.matchMedia && W.matchMedia("(prefers-reduced-motion: reduce)").matches);
var G = W.gsap || null; if (G && W.ScrollTrigger) G.registerPlugin(W.ScrollTrigger);

/* ---------- helpers ---------- */
function esc(s){return String(s == null ? "" : s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function url(u){u = String(u||"").trim(); return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : "";}
function img(u){u = String(u||""); return (/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(u) || /^(https?:\/\/|\/)[^\s"'<>]+$/i.test(u)) ? u : "";}
function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,7);}
function clone(o){return JSON.parse(JSON.stringify(o));}
function paras(t){return String(t||"").split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean).map(function(p){return "<p>"+esc(p).replace(/\n/g,"<br>")+"</p>";}).join("");}
var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function pd(s){var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s||""); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null;}
function fd(s){var d = pd(s); return d ? d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear() : "";}
function today(){var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());}
function isoToday(){var d = today(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function initials(n){return String(n||"?").trim().split(/\s+/).slice(0,2).map(function(w){return w.charAt(0);}).join("").toUpperCase() || "?";}
function digits(p){p = String(p||"").replace(/\D/g,""); if (p.charAt(0)==="0") p = "234"+p.slice(1); return p;}
function prettyPhone(p){var d = String(p||"").replace(/\D/g,""); return d.length===11 ? d.slice(0,4)+" "+d.slice(4,7)+" "+d.slice(7) : p;}
function contacts(){return String(state.settings.contacts||"").split("\n").map(function(l){var a = l.split("|").map(function(x){return x.trim();}); return a[0] ? {name:a[0], role:a[1]||"", phone:a[2]||""} : null;}).filter(Boolean);}
function bytes(){try{return new Blob([JSON.stringify(state)]).size;}catch(e){return 0;}}
function dirty(){return JSON.stringify(state) !== PUBLISHED;}
function ls(k,v){try{ if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k,v);}catch(e){} return null;}
function words(t){return esc(t).split(" ").map(function(w){return '<span>'+w+'</span>';}).join(" ");}

var IC = {
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
  in:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/></svg>',
  xx:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l16 16M20 4 4 20"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v11a4 4 0 1 1-4-4"/><path d="M14 3c1 3 3 4 6 4"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  brief:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 10a4 4 0 0 0 5 5"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  mega:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a3 3 0 0 1 0 6M18 6a7 7 0 0 1 0 12"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/></svg>'
};
function emblem(){return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B8862E"/><stop offset="1" stop-color="#F0CB7A"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="#141210" stroke="url(#eg)" stroke-width="2.5"/><g fill="none" stroke="url(#eg)" stroke-width="1.6"><ellipse cx="32" cy="32" rx="17" ry="6.5"/><ellipse cx="32" cy="32" rx="17" ry="6.5" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="17" ry="6.5" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="3.2" fill="#F4EFE6"/></svg>';}
function logo(){var l = img(state.settings.logo); return l ? '<img src="'+l+'" alt="PESSA logo">' : emblem();}

/* ---------- content model ---------- */
var STUDENT_CATS = ["Academic","Social","Sports","Humanitarian","All-Rounder"];
var LECTURER_CATS = ["Academic","Social"];
function catsFor(kind){return kind==="Lecturer" ? LECTURER_CATS : kind==="Student" ? STUDENT_CATS : [];}
var DEPT_COLORS = {CHM:"#7EE2A0",MAT:"#D4A64A",PHY:"#4F8DFF",STA:"#8FB8FF",GEO:"#E08A4F",ENV:"#5CC9A8",BST:"#F0CB7A",DSC:"#6FD3FF"};
var DC_LIST = ["#D4A64A","#4F8DFF","#F0CB7A","#8FB8FF","#7EE2A0","#E08A4F","#5CC9A8","#6FD3FF"];
function deptColor(d, i){return DEPT_COLORS[(d.code||"").toUpperCase()] || DC_LIST[i % DC_LIST.length];}
function deptNames(){return state.departments.map(function(d){return d.name;});}
var C = {
  news:{label:"News",one:"news story",title:"title",sub:function(i){return fd(i.date)+(i.category?" · "+i.category:"");},imgKey:"cover",
    sort:function(a,b){return (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"title",l:"Headline",t:"text",req:1},{k:"date",l:"Date",t:"date",req:1},{k:"category",l:"Category",t:"select",o:["Announcement","Event Recap","Academics","Sports","Social","Partnership","Welfare"]},{k:"cover",l:"Cover photo",t:"image",w:1600,h:1000},{k:"summary",l:"Short summary (shows on cards)",t:"textarea",req:1},{k:"body",l:"Full story",t:"long",hint:"Leave an empty line between paragraphs."},{k:"link",l:"Related link (optional)",t:"url"}]},
  spotlights:{label:"Spotlight",one:"spotlight",title:"name",sub:function(i){return i.kind+" of the "+i.period+(i.kind==="Student"&&i.category?" · "+i.category:"")+(i.periodLabel?" · "+i.periodLabel:"");},imgKey:"photo",
    sort:function(a,b){return (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"kind",l:"Who is this for?",t:"select",o:["Student","Lecturer","Department"],req:1},{k:"category",l:"Category",t:"select",o:function(){return (draft && draft.item && draft.item.kind==="Lecturer") ? LECTURER_CATS : STUDENT_CATS;},when:function(i){return i.kind==="Student" || i.kind==="Lecturer";},hint:"Students: Academic, Social, Sports, Humanitarian or All-Rounder. Lecturers: Academic or Social."},{k:"period",l:"Of the",t:"select",o:["Week","Month"],req:1},{k:"periodLabel",l:"Period label",t:"text",hint:"For example: Week 3, November 2026"},{k:"date",l:"Date announced",t:"date",req:1},{k:"name",l:"Name",t:"text",req:1,hint:"For a department, enter the department name."},{k:"department",l:"Department",t:"select",o:deptNames,when:function(i){return i.kind!=="Department";}},{k:"level",l:"Level",t:"select",o:["100","200","300","400","500"],when:function(i){return i.kind==="Student";}},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"citation",l:"Why they were chosen",t:"textarea",req:1},{k:"handle",l:"Instagram handle (optional)",t:"text"}]},
  events:{label:"Events",one:"event",title:"title",sub:function(i){return (i.date?fd(i.date):(i.dateLabel||"Date to be announced"))+(i.category?" · "+i.category:"");},imgKey:"poster",
    sort:function(a,b){return evKey(a).localeCompare(evKey(b));},
    fields:[{k:"title",l:"Event name",t:"text",req:1},{k:"date",l:"Date",t:"date",hint:"Leave empty if the date is not fixed yet."},{k:"dateLabel",l:"Date note (when no exact date)",t:"text",hint:"For example: Mid-December 2026"},{k:"time",l:"Time",t:"text",hint:"For example: 10:00 AM"},{k:"venue",l:"Venue",t:"text"},{k:"category",l:"Category",t:"select",o:["Academics","Sports","Social","Other"],req:1},{k:"description",l:"Description",t:"long"},{k:"poster",l:"Flyer or photo",t:"image",w:1600,h:2000},{k:"link",l:"Registration or info link (optional)",t:"url"}]},
  excos:{label:"Executives",one:"executive",title:"name",sub:function(i){return i.position;},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Full name",t:"text",req:1},{k:"position",l:"Position",t:"text",req:1},{k:"department",l:"Department",t:"select",o:deptNames},{k:"level",l:"Level",t:"select",o:["100","200","300","400","500"]},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"instagram",l:"Instagram handle (optional)",t:"text"},{k:"bio",l:"Short bio (optional)",t:"textarea"}]},
  departments:{label:"Departments",one:"department",title:"name",sub:function(i){return i.type;},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Name",t:"text",req:1},{k:"code",l:"Short code",t:"text",hint:"Two to four letters, for example MAT"},{k:"type",l:"Type",t:"select",o:["Department","Sub-department"],req:1},{k:"about",l:"About",t:"textarea"},{k:"hod",l:"Head of Department",t:"text"},{k:"rep",l:"Department president or rep",t:"text"},{k:"assoc",l:"Departmental association",t:"text",hint:"For example: NAMSSN UNILAG"},{k:"site",l:"Association website",t:"url"},{k:"instagram",l:"Association Instagram (no @)",t:"text"},{k:"email",l:"Department email",t:"text"},{k:"photo",l:"Photo",t:"image",w:1600,h:1000}]},
  gallery:{label:"Gallery",one:"photo",title:"caption",sub:function(i){return (i.event||"")+(i.date?" · "+fd(i.date):"");},imgKey:"image",
    sort:function(a,b){return (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"image",l:"Photo",t:"image",w:1800,h:1800,req:1},{k:"caption",l:"Caption",t:"text"},{k:"event",l:"Event",t:"text"},{k:"date",l:"Date",t:"date"}]},
  opportunities:{label:"Opportunities",one:"opportunity",title:"title",sub:function(i){return i.type+(i.deadline?" · closes "+fd(i.deadline):"");},
    sort:function(a,b){return (a.deadline||"9999").localeCompare(b.deadline||"9999");},
    fields:[{k:"title",l:"Title",t:"text",req:1},{k:"type",l:"Type",t:"select",o:["Internship","Scholarship","Competition","Job","Fellowship","Conference","Training"],req:1},{k:"org",l:"Organisation",t:"text"},{k:"deadline",l:"Deadline",t:"date"},{k:"description",l:"Details",t:"textarea"},{k:"link",l:"Apply link",t:"url",req:1}]},
  resources:{label:"Resources",one:"resource",title:"title",sub:function(i){return i.type+(i.department?" · "+i.department:"");},ordered:1,
    fields:[{k:"title",l:"Title",t:"text",req:1},{k:"type",l:"Type",t:"select",o:["Past Questions","Course Materials","Lecture Notes","Timetable","Handbook","Form","Other"],req:1},{k:"department",l:"Department",t:"select",o:function(){return ["All departments"].concat(deptNames());}},{k:"level",l:"Level",t:"select",o:["All levels","100","200","300","400","500"]},{k:"link",l:"Link (Google Drive, etc.)",t:"url",req:1}]},
  partners:{label:"Partners",one:"partner",title:"name",sub:function(i){return i.tier;},imgKey:"logo",ordered:1,
    fields:[{k:"name",l:"Name",t:"text",req:1},{k:"tier",l:"Role",t:"select",o:["Headline Sponsor","Platinum Sponsor","Gold Sponsor","Silver Sponsor","Bronze Sponsor","Programme Partner","Media Partner"],req:1},{k:"logo",l:"Logo",t:"image",w:800,h:800,png:1},{k:"note",l:"What they supported",t:"text"},{k:"link",l:"Website",t:"url"}]},
  alumni:{label:"Alumni",one:"alumnus",title:"name",sub:function(i){return (i.year?"Class of "+i.year:"")+(i.role?" · "+i.role:"");},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Full name",t:"text",req:1},{k:"year",l:"Graduation year",t:"text"},{k:"department",l:"Department",t:"select",o:deptNames},{k:"role",l:"Current role and organisation",t:"text"},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"linkedin",l:"LinkedIn link (optional)",t:"url"}]},
  faqs:{label:"FAQs",one:"question",title:"q",sub:function(){return "";},ordered:1,
    fields:[{k:"q",l:"Question",t:"text",req:1},{k:"a",l:"Answer",t:"textarea",req:1}]},
  pastExcos:{label:"Past executives",one:"past executive",title:"name",sub:function(i){return i.session+(i.admin?" · "+i.admin:"")+" · "+i.position;},imgKey:"photo",
    sort:function(a,b){return (b.session||"").localeCompare(a.session||"") || (a.order||99)-(b.order||99);},
    fields:[{k:"session",l:"Session",t:"text",req:1,hint:"For example: 2025/2026"},{k:"admin",l:"Administration name",t:"text",hint:"For example: The Pioneers"},{k:"name",l:"Full name",t:"text",req:1},{k:"position",l:"Position",t:"text",req:1},{k:"order",l:"Order in the list (1 = President)",t:"text"},{k:"department",l:"Department",t:"select",o:deptNames},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"note",l:"Highlight or legacy (optional)",t:"textarea"}]},
  reps:{label:"House of Reps",one:"representative",title:"name",sub:function(i){return i.role+(i.department?" · "+i.department:"");},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Full name",t:"text",req:1},{k:"role",l:"Role",t:"select",o:["Speaker","Deputy Speaker","Clerk","Chief Whip","Majority Leader","Committee Chair","Member"],req:1},{k:"department",l:"Department",t:"select",o:deptNames},{k:"level",l:"Level",t:"select",o:["100","200","300","400","500"]},{k:"committee",l:"Committee (optional)",t:"text"},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"instagram",l:"Instagram handle (optional)",t:"text"}]},
  announcements:{label:"Announcements",one:"announcement",title:"title",sub:function(i){return fd(i.date)+(i.pinned==="Yes"?" · pinned":"");},
    sort:function(a,b){return (b.pinned==="Yes")-(a.pinned==="Yes") || (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"title",l:"Title",t:"text",req:1},{k:"date",l:"Date",t:"date",req:1},{k:"category",l:"Category",t:"select",o:["Notice","Academic","Exams","Welfare","Deadline","Event"]},{k:"body",l:"Details",t:"long",req:1},{k:"link",l:"Link (optional)",t:"url"},{k:"pinned",l:"Pin to the top",t:"select",o:["No","Yes"]}]},
  articles:{label:"Journal articles",one:"article",title:"title",sub:function(i){return (i.author||"")+" · "+fd(i.date);},imgKey:"cover",
    sort:function(a,b){return (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"title",l:"Title",t:"text",req:1},{k:"author",l:"Author",t:"text",req:1},{k:"date",l:"Date",t:"date",req:1},{k:"tags",l:"Tags (comma separated)",t:"text",hint:"For example: Physics, Careers"},{k:"summary",l:"Summary (shows on cards)",t:"textarea",req:1},{k:"body",l:"Full article",t:"long",req:1,hint:"Leave an empty line between paragraphs."},{k:"cover",l:"Cover image (optional)",t:"image",w:1600,h:1000}]},
  patrons:{label:"Patrons & lecturers",one:"patron",title:"name",sub:function(i){return i.role+(i.department?" · "+i.department:"");},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Full name with title",t:"text",req:1,hint:"For example: Prof. A. B. Cole"},{k:"role",l:"Role",t:"text",req:1,hint:"For example: Dean, Sub-Dean, Head of Department, Staff Adviser"},{k:"group",l:"Group",t:"select",o:["Patron","Faculty leadership","Lecturer"],req:1},{k:"department",l:"Department",t:"select",o:deptNames},{k:"photo",l:"Photo",t:"image",w:1000,h:1250},{k:"note",l:"Short note (optional)",t:"textarea"}]},
  research:{label:"Research",one:"paper",title:"title",sub:function(i){return (i.authors||"")+(i.year?" · "+i.year:"");},
    sort:function(a,b){return (b.year||"").localeCompare(a.year||"");},
    fields:[{k:"title",l:"Paper title",t:"text",req:1},{k:"authors",l:"Authors",t:"text",req:1},{k:"department",l:"Department",t:"select",o:deptNames},{k:"journal",l:"Journal or conference",t:"text"},{k:"year",l:"Year",t:"text"},{k:"link",l:"Link",t:"url"}]},
  newsletters:{label:"Newsletters",one:"newsletter issue",title:"title",sub:function(i){return (i.issue?i.issue+" · ":"")+fd(i.date);},imgKey:"cover",
    sort:function(a,b){return (b.date||"").localeCompare(a.date||"");},
    fields:[{k:"title",l:"Title",t:"text",req:1},{k:"issue",l:"Issue",t:"text",hint:"For example: Vol. 1, No. 3"},{k:"date",l:"Date",t:"date",req:1},{k:"summary",l:"What is inside",t:"textarea"},{k:"cover",l:"Cover",t:"image",w:1200,h:1600},{k:"link",l:"Read link (PDF or Drive)",t:"url",req:1}]},
  merch:{label:"Merchandise",one:"item",title:"name",sub:function(i){return i.price;},imgKey:"photo",ordered:1,
    fields:[{k:"name",l:"Item",t:"text",req:1},{k:"price",l:"Price",t:"text",req:1,hint:"For example: ₦8,000"},{k:"photo",l:"Photo",t:"image",w:1200,h:1200},{k:"note",l:"Sizes, colours or notes",t:"text"},{k:"link",l:"Order link (WhatsApp, form or store)",t:"url"},{k:"status",l:"Availability",t:"select",o:["Available","Pre-order","Sold out"],req:1}]},
  tiers:{label:"Sponsor tiers",one:"sponsorship tier",title:"name",sub:function(i){return i.price;},ordered:1,
    fields:[{k:"name",l:"Tier name",t:"text",req:1},{k:"price",l:"Price",t:"text",req:1,hint:"For example: ₦2,000,000"},{k:"tag",l:"One-line summary",t:"text"},{k:"benefits",l:"Benefits (one per line)",t:"long",req:1},{k:"featured",l:"Highlight this tier",t:"select",o:["No","Yes"]}]}
};
var SETTINGS = [
  {h:"Identity"},
  {k:"logo",l:"PESSA logo",t:"image",w:600,h:600,png:1,hint:"Use a transparent PNG for the best result."},
  {k:"name",l:"Full name",t:"text",req:1},{k:"short",l:"Short name",t:"text",req:1},
  {k:"faculty",l:"Faculty",t:"text"},{k:"university",l:"University",t:"text"},
  {k:"admin",l:"Administration name",t:"text"},{k:"session",l:"Session",t:"text"},{k:"founded",l:"Founded",t:"text"},
  {h:"Announcement bar (top of every page)"},
  {k:"announcement",l:"Announcement text",t:"text",hint:"Leave empty to hide the bar."},{k:"announcementLink",l:"Announcement link (optional)",t:"url"},
  {h:"Home page"},
  {k:"heroLine1",l:"Headline, first part",t:"text"},{k:"heroLine2",l:"Headline, gradient word",t:"text"},{k:"heroSub",l:"Text under headline",t:"textarea"},{k:"heroImage",l:"Home page photo",t:"image",w:1600,h:2000},{k:"glanceImage",l:"Photo behind the numbers band",t:"image",w:2000,h:1200},{k:"presidentQuote",l:"Message from the President (home page quote)",t:"textarea"},
  {h:"About"},
  {k:"about",l:"About PESSA",t:"long"},{k:"vision",l:"Vision",t:"textarea"},{k:"mission",l:"Mission",t:"textarea"},
  {h:"Contact"},
  {k:"contacts",l:"Contact people",t:"textarea",hint:"One per line: Name | Role | Phone"},
  {k:"waNumber",l:"WhatsApp number that receives website forms",t:"text"},
  {k:"email",l:"Email",t:"text"},{k:"address",l:"Address",t:"text"},
  {k:"waCommunity",l:"WhatsApp community link",t:"url"},
  {k:"instagram",l:"Instagram handle (no @)",t:"text"},{k:"linkedin",l:"LinkedIn page link",t:"url"},{k:"linkedinName",l:"LinkedIn page name",t:"text"},
  {k:"x",l:"X handle (no @)",t:"text"},{k:"tiktok",l:"TikTok handle (no @)",t:"text"},
  {h:"Optional: Google Form links",note:"If you add a Google Form link, that form replaces the built-in WhatsApp form on the site."},
  {k:"suggestionForm",l:"Suggestion box form",t:"url"},{k:"nominationForm",l:"Spotlight nomination form",t:"url"},{k:"alumniForm",l:"Alumni sign-up form",t:"url"},{k:"contactForm",l:"Contact form",t:"url"},
  {k:"partnerDeck",l:"Sponsorship deck link (PDF, optional)",t:"url"},
  {h:"Sponsorship page numbers"},
  {k:"deckStudents",l:"Students in the faculty",t:"text"},{k:"deckIntake",l:"New intake each year",t:"text"},{k:"deckAges",l:"Age range",t:"text"},{k:"deckReach",l:"Combined social reach",t:"text"},{k:"deckEmail",l:"Email database reach",t:"text"}
];
function opts(f){return typeof f.o === "function" ? f.o() : f.o;}
function evKey(e){return e.date ? "0"+e.date : "1"+(e.dateLabel||"");}

/* ---------- routing ---------- */
var PAGES = [
  ["home","Home","Start"],["about","About","Vision · Mission"],["excos","Executives","The Pharonia · Hall of fame"],["reps","House of Representatives","Legislature"],["departments","Departments","6 + 2"],
  ["news","News","Latest"],["spotlight","Spotlight","Week · Month"],["events","Events","2026/27"],["gallery","Gallery","Photos"],
  ["opportunities","Opportunities","Internships · Scholarships"],["resources","Resources","Past questions · Notes"],["alumni","Alumni","Network"],
  ["partner","Sponsorship","Partner with us"],["contact","Contact","Suggestion box"],
  ["academics","Academics","Announcements · Materials · Timetable"],["tools","Student Tools","CGPA calculator · Targets"],["community","Community","Journal · Articles"],["newsletter","Newsletter","Archive"],["merch","Merchandise","Official PESSA gear"]
];
var PREFIX = {news:"news", events:"events", community:"community", departments:"departments"};
function route(){var p = String(PATH||"/").replace(/\/+$/,"").replace(/^\//,""); if (!p) return {p:"home"}; var m = /^(news|events|community|departments)\/([A-Za-z0-9_-]+)$/.exec(p); if (m) return {p:PREFIX[m[1]], id:m[2]}; return {p: PAGES.some(function(x){return x[0]===p;}) ? p : "notfound"};}
function hrefFor(h){ if (h==="home") return "/"; var m = /^(news|event|article|dept)-([A-Za-z0-9_-]+)$/.exec(h); if (m) return "/"+{news:"news",event:"events",article:"community",dept:"departments"}[m[1]]+"/"+m[2]; if (h==="nominate") return "/spotlight#nominate"; if (h==="suggest") return "/contact#suggest"; if (PAGES.some(function(x){return x[0]===h;})) return "/"+h; return null; }
function fixLinks(html){ return html.replace(/href="#([A-Za-z0-9_-]+)"/g, function(all, h){ var p = hrefFor(h); return p ? 'href="'+p+'"' : all; }); }
var SLUG = {pastExcos:"past-excos"};
function adminUrl(act, coll, id){ var s = SLUG[coll] || coll; if (act==="settings" || coll==="settings") return ADMIN+"/globals/settings"; if (act==="add") return ADMIN+"/collections/"+s+"/create"; if (act==="manage" || act==="mgr") return ADMIN+"/collections/"+s; if (id) return ADMIN+"/collections/"+s+"/"+id; return ADMIN; }

/* ---------- shared bits ---------- */
function eb(act, label, extra){ if (!editMode) return ""; var c = /data-c="([^"]+)"/.exec(extra||""), i = /data-id="([^"]+)"/.exec(extra||""); return '<a class="eb" href="'+adminUrl(act, c?c[1]:"", i?i[1]:"")+'">'+IC.edit.replace('<svg','<svg width="14" height="14"')+esc(label)+'</a>'; }
function tools(coll,id){return editMode ? '<div class="card-tools"><a href="'+adminUrl("edit",coll,id)+'" aria-label="Edit" title="Edit">'+IC.edit+'</a></div>' : "";}
function orbs(){return '<div class="orbs" aria-hidden="true"><i></i><i></i><i></i></div>';}
function phead(eyebrow, title, lead, extra){return '<header class="phead"><div class="wrap"><div class="crumbs rv"><a href="#home">Home</a> &nbsp;/&nbsp; '+esc(eyebrow)+'</div><h1 class="dsp h-lg rv">'+title+'</h1>'+(lead?'<p class="lead rv">'+esc(lead)+'</p>':'')+(extra?'<div class="row rv">'+extra+'</div>':'')+'</div></header>';}
function empty(title, text, coll){return '<div class="empty rv"><div class="dsp">'+esc(title)+'</div><p>'+esc(text)+'</p>'+(editMode&&coll?'<button class="btn btn-ink btn-sm" data-act="add" data-c="'+coll+'">Add the first '+esc(C[coll].one)+'</button>':'')+'</div>';}
function secH(eyebrow, title, link, coll){return '<div class="sec-h rv"><div><span class="eyebrow">'+esc(eyebrow)+'</span><h2 class="dsp h-md">'+title+'</h2></div><div class="btns">'+(coll&&editMode?'<button class="eb" data-act="add" data-c="'+coll+'">+ Add '+esc(C[coll].one)+'</button>':'')+(link?'<a class="more" href="#'+link[0]+'">'+esc(link[1])+' '+IC.arrow+'</a>':'')+'</div></div>';}
function face(src, name, pic){var s = img(src), dp = pic ? ' data-pic="'+esc(pic)+'"' : ''; return s ? '<img class="portrait" src="'+s+'" alt="'+esc(name)+'" loading="lazy"'+dp+'>' : '<div class="ghost" data-g="'+esc(initials(name).charAt(0))+'"'+dp+'><b>'+esc(initials(name))+'</b></div>';}
function tilt(){return '';}

function newsCard(n){
  var c = img(n.cover);
  return '<article class="card rv">'+tools("news",n.id)+'<a class="cover" href="#news-'+n.id+'">'+(c?'<img class="thumb" src="'+c+'" alt="" loading="lazy" data-pic="news:'+n.id+':cover">':'<div class="ph" data-pic="news:'+n.id+':cover"><b>'+esc(state.settings.short)+'</b></div>')+'</a><div class="body"><div class="meta"><span class="pill g">'+esc(n.category||"News")+'</span><span>'+esc(fd(n.date))+'</span></div><h3><a href="#news-'+n.id+'" style="text-decoration:none">'+esc(n.title)+'</a></h3><p class="muted clamp3">'+esc(n.summary)+'</p></div>'+tilt()+'</article>';
}
function evStatus(e){var d = pd(e.date); if (!d) return {cls:"", txt:"Planned"}; var t = today(); if (d < t) return {cls:"k", txt:"Held"}; if (+d === +t) return {cls:"ok", txt:"Today"}; return {cls:"g", txt:"Upcoming"};}
function evRow(e){
  var d = pd(e.date), st = evStatus(e);
  var box = d ? '<div class="d"><span>'+MON[d.getMonth()]+'</span><b>'+d.getDate()+'</b><span>'+d.getFullYear()+'</span></div>' : '<div class="d tba"><span>Date</span><b>TBA</b></div>';
  var bits = [];
  if (!d) bits.push(esc(e.dateLabel||"Date to be announced"));
  if (e.time) bits.push(esc(e.time));
  if (e.venue) bits.push(esc(e.venue));
  return '<div class="ev rv">'+box+'<a href="#event-'+e.id+'"><div class="meta" style="margin-bottom:5px"><span class="pill '+st.cls+'">'+st.txt+'</span><span>'+esc(e.category)+'</span></div><h3>'+esc(e.title)+'</h3>'+(bits.length?'<div class="muted" style="font-size:14px">'+bits.join(" · ")+'</div>':'')+'</a><div class="act">'+(editMode?'<span class="btns"><button class="ib" data-act="edit" data-c="events" data-id="'+e.id+'" aria-label="Edit">'+IC.edit+'</button><button class="ib" data-act="del" data-c="events" data-id="'+e.id+'" aria-label="Delete">'+IC.del+'</button></span>':'<a class="more" href="#event-'+e.id+'">Details '+IC.arrow+'</a>')+'</div></div>';
}
function evCard(e){
  var d = pd(e.date);
  return '<a class="card evc rv" href="#event-'+e.id+'">'+tools("events",e.id)+'<div class="meta"><span class="pill '+evStatus(e).cls+'">'+evStatus(e).txt+'</span><span>'+esc(e.category)+'</span></div>'+(d?'<div class="d"><b>'+d.getDate()+'</b><span>'+MON[d.getMonth()]+' '+d.getFullYear()+'</span></div>':'<div class="d"><b>TBA</b><span>'+esc(e.dateLabel||"Date soon")+'</span></div>')+'<h3>'+esc(e.title)+'</h3>'+(e.venue?'<div class="muted" style="font-size:14px;display:flex;gap:8px;align-items:center">'+IC.pin.replace('<svg','<svg width="16" height="16"')+esc(e.venue)+'</div>':'')+tilt()+'</a>';
}
function spotTitle(s){return s.kind+" of the "+s.period;}
function faceRound(src, name, pic){var s = img(src), dp = pic ? ' data-pic="'+esc(pic)+'"' : ''; return '<div class="avatar">'+(s ? '<img src="'+s+'" alt="'+esc(name)+'" loading="lazy"'+dp+'>' : '<div class="ghost-r"'+dp+'><b>'+esc(initials(name))+'</b></div>')+'</div>';}
function spotCard(s, big){
  var sub = [s.kind==="Department" ? "" : s.department, s.level ? s.level+" Level" : ""].filter(Boolean).join(" · ");
  var per = (s.period||"Week").toLowerCase();
  return '<div class="holo rv"><article class="card spot">'+tools("spotlights",s.id)+'<div class="period-tag '+per+'"><span>'+esc(s.kind)+'</span> of the <b>'+esc(s.period)+'</b></div><button data-act="view-spot" data-id="'+s.id+'" style="all:unset;cursor:pointer;display:block">'+faceRound(s.photo,s.name,"spotlights:"+s.id+":photo")+'</button><div class="nm">'+esc(s.name)+'</div>'+(sub?'<div class="role">'+esc(sub)+'</div>':'')+(s.kind!=="Department"&&s.category?'<span class="pill k">'+esc(s.category)+'</span>':'')+'<p class="muted '+(big?'':'clamp3')+'" style="font-size:14.5px">'+esc(s.citation)+'</p><div class="meta">'+esc(s.periodLabel||fd(s.date))+'</div></article></div>';
}
function currentSpots(){
  var out = [];
  ["Student","Lecturer","Department"].forEach(function(k){["Week","Month"].forEach(function(p){
    var list = state.spotlights.filter(function(s){return s.kind===k && s.period===p;});
    if (!list.length) return;
    var max = list.reduce(function(m,s){return (s.date||"") > m ? s.date : m;}, "");
    list.filter(function(s){return (s.date||"")===max;}).forEach(function(s){out.push(s);});
  });});
  return out;
}
function deptCard(d, i){
  var p = img(d.photo), col = deptColor(d, i);
  return '<article class="card rv" style="--dc:'+col+'">'+tools("departments",d.id)+(p?'<img class="thumb" src="'+p+'" alt="" loading="lazy" data-pic="departments:'+d.id+':photo">':(editMode?'<div class="ph" style="aspect-ratio:16/6" data-pic="departments:'+d.id+':photo"><b style="font-size:18px">Add photo</b></div>':''))+'<a class="dept" href="#dept-'+d.id+'" style="text-decoration:none"><div class="code">'+esc(d.code||initials(d.name))+'</div><h3>'+esc(d.name)+'</h3><div class="btns" style="gap:6px"><span class="pill">'+esc(d.type)+'</span>'+(d.assoc?'<span class="pill g">'+esc(d.assoc)+'</span>':'')+'</div>'+(d.about?'<p class="muted clamp3" style="font-size:14.5px">'+esc(d.about)+'</p>':'')+(d.hod?'<div style="font-size:14px"><b>HOD:</b> '+esc(d.hod)+'</div>':'')+'<span class="more" style="margin-top:4px">Department page '+IC.arrow+'</span></a>'+tilt()+'</article>';
}
function pillars(){
  var P = [["Academics",IC.book,"Mentorship, tutorials, the PESSA Innovation Challenge and workshops that lift every student's results."],["Industry",IC.brief,"Seminars, bootcamps and partnerships that connect the classroom to careers."],["Sports",IC.trophy,"Ball It Out, the Freshers' Cup, HOD Games and the Deans' Games."],["Student life",IC.spark,"Orientation, Triwave, Karaoke Night, Faculty Week and the Dinner & Awards Night."]];
  return '<div class="pillars">'+P.map(function(p){return '<div class="pillar rv"><div class="ic">'+p[1]+'</div><div class="k">'+p[0]+'</div><p>'+p[2]+'</p></div>';}).join("")+'</div><p class="muted rv" style="margin-top:22px;max-width:70ch;font-size:16px">Unity, inclusion and fair representation for every department run through all four.</p>';
}
function ticker(){
  var items = ['<span class="g">'+esc(state.settings.short)+' speaks excellence</span>'].concat(state.departments.map(function(d){return '<span>'+esc(d.name)+'</span>';})).concat(['<span class="g">'+esc(state.settings.admin)+' · '+esc(state.settings.session)+'</span>']).join("");
  return '<div class="ticker" aria-hidden="true"><div class="track">'+items+items+'</div></div>';
}
function faqList(){
  if (!state.faqs.length) return empty("No questions yet","Common questions will be answered here.","faqs");
  return '<div style="max-width:820px">'+state.faqs.map(function(f){return '<details class="faq rv"><summary>'+esc(f.q)+'</summary><p>'+esc(f.a)+'</p>'+(editMode?'<div class="btns" style="margin-top:10px"><button class="eb" data-act="edit" data-c="faqs" data-id="'+f.id+'">Edit</button><button class="eb" data-act="del" data-c="faqs" data-id="'+f.id+'">Delete</button></div>':'')+'</details>';}).join("")+'</div>';
}
function contactCard(c){var d = digits(c.phone); return '<div class="contact rv"><span>'+esc(c.role)+'</span><b>'+esc(c.name)+'</b>'+(c.phone?'<div class="copyline" style="margin-top:8px"><code>'+esc(prettyPhone(c.phone))+'</code><a class="btn btn-glass btn-sm" href="https://wa.me/'+d+'" target="_blank" rel="noopener">WhatsApp</a><button class="btn btn-glass btn-sm" data-act="copy" data-v="'+esc(c.phone)+'">Copy</button></div>':'')+'</div>';}
function socials(){
  var S = state.settings, a = [];
  if (S.instagram) a.push('<a href="https://instagram.com/'+encodeURIComponent(S.instagram)+'" target="_blank" rel="noopener">'+IC.ig+'@'+esc(S.instagram)+'</a>');
  if (url(S.waCommunity)) a.push('<a href="'+url(S.waCommunity)+'" target="_blank" rel="noopener">'+IC.wa+'WhatsApp community</a>');
  if (url(S.linkedin)) a.push('<a href="'+url(S.linkedin)+'" target="_blank" rel="noopener">'+IC.in+'LinkedIn</a>');
  if (S.x) a.push('<a href="https://x.com/'+encodeURIComponent(S.x)+'" target="_blank" rel="noopener">'+IC.xx+'@'+esc(S.x)+'</a>');
  if (S.tiktok) a.push('<a href="https://tiktok.com/@'+encodeURIComponent(S.tiktok)+'" target="_blank" rel="noopener">'+IC.tt+'@'+esc(S.tiktok)+'</a>');
  if (S.email) a.push('<a href="mailto:'+esc(S.email)+'">'+IC.mail+esc(S.email)+'</a>');
  return a.join("");
}
