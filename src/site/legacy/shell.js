/* ---------- shell ---------- */
function header(cur){
  var S = state.settings;
  var main = [["home","Home"],["about","About"],["academics","Academics"],["news","News"],["events","Events"],["spotlight","Spotlight","opt"],["excos","Executives","opt"],["partner","Sponsorship","opt"],["contact","Contact","opt"]];
  var util = '<div class="util"><div class="wrap"><div class="l"><a href="#tools">Student tools</a><a href="#academics">Academics</a><a href="#community">Journal</a><a href="#alumni">Alumni</a><a href="#partner">Partners</a></div><div class="r">'+(S.email?'<a href="mailto:'+esc(S.email)+'">'+esc(S.email)+'</a>':'')+(url(S.waCommunity)?'<a href="'+url(S.waCommunity)+'" target="_blank" rel="noopener">WhatsApp community</a>':'')+(S.instagram?'<a href="https://instagram.com/'+encodeURIComponent(S.instagram)+'" target="_blank" rel="noopener">@'+esc(S.instagram)+'</a>':'')+'</div></div></div>';
  var ann = S.announcement && !annClosed ? '<div class="annbar"><div class="wrap">'+(url(S.announcementLink)?'<a href="'+url(S.announcementLink)+'" target="_blank" rel="noopener">':'<span>')+IC.mega.replace('<svg','<svg width="15" height="15"')+esc(S.announcement)+(url(S.announcementLink)?'</a>':'</span>')+'<button class="x" data-act="ann-close" aria-label="Dismiss">'+IC.x+'</button></div></div>' : '';
  return ann+util+'<header class="hdr'+((W.scrollY||0)>40?' scrolled':'')+'" id="hdr"><div class="wrap"><a class="brand" href="#home">'+logo()+'<span class="nm"><span class="full">'+esc(S.name)+'</span><span class="short">'+esc(S.short)+'</span><span class="uni">UNILAG</span></span></a><nav class="nav" aria-label="Main">'+main.map(function(m){return '<a href="#'+m[0]+'" class="'+(m[2]||"")+'"'+(cur===m[0]?' aria-current="page"':'')+'>'+m[1]+'</a>';}).join("")+'</nav><button class="menu-btn" data-act="menu" aria-expanded="false">'+IC.menu+'Menu</button></div></header>';
}
function drawer(cur){
  return '<div class="drawer" role="dialog" aria-modal="true" aria-label="Site menu"><div class="orb" aria-hidden="true"></div><div class="wrap"><div class="drawer-top"><a class="brand" href="#home">'+logo()+'<span class="nm"><span class="short">'+esc(state.settings.short)+'</span><span class="uni">UNILAG</span></span></a><button class="menu-btn" data-act="menu" style="margin-left:0;background:#F7F3EA;color:#141210">'+IC.x.replace('<svg','<svg width="18" height="18"')+'Close</button></div><nav>'+PAGES.map(function(p){return '<a href="#'+p[0]+'" class="dl"'+(cur===p[0]?' aria-current="page"':'')+'>'+p[1]+'<small>'+esc(p[2])+'</small></a>';}).join("")+'</nav><div class="dfoot"><span>'+esc(state.settings.email)+'</span><span>'+esc(state.settings.address)+'</span></div></div></div>';
}
function footer(){
  var S = state.settings;
  var col = function(t,items){return '<div><h4>'+t+'</h4><ul>'+items.map(function(i){return '<li><a href="#'+i[0]+'">'+i[1]+'</a></li>';}).join("")+'</ul></div>';};
  return '<footer class="foot"><div class="wrap top"><div style="display:grid;gap:16px;align-content:start"><a class="brand" href="#home">'+logo()+'<span class="nm"><span class="full" style="display:block;color:#F7F3EA">'+esc(S.name)+'</span><span class="uni">UNILAG</span></span></a><p style="color:#C9C2B4;font-size:14.5px;max-width:44ch">'+esc(S.address)+'</p><p class="signoff">'+esc(S.admin)+' - '+esc(S.short)+' '+esc(String(S.session||"").replace(/20(\d\d)\/20(\d\d)/,"$1/$2"))+' Executives</p><div class="socials">'+socials()+'</div></div>'+
  col("Association",[["about","About"],["excos","Executives"],["reps","House of Representatives"],["departments","Departments"],["alumni","Alumni"]])+
  col("Updates",[["news","News"],["spotlight","Spotlight"],["events","Events"],["gallery","Gallery"],["newsletter","Newsletter"],["community","Journal"]])+
  col("Students & partners",[["academics","Academics"],["tools","Student tools"],["opportunities","Opportunities"],["merch","Merchandise"],["partner","Sponsorship"],["contact","Contact & suggestions"]])+
  '</div><div class="wrap base"><span>&copy; '+new Date().getFullYear()+' '+esc(S.name)+', '+esc(S.university)+'</span><span>'+esc(S.faculty)+(editMode?'':' · <a href="'+ADMIN+'" style="color:inherit">Staff sign in</a>')+'</span></div></footer>';
}
function editBar(){
  if (!editMode) return "";
  var r = route(), coll = {news:"news", events:"events", community:"articles", departments:"departments"}[r.p];
  return '<div class="ebar"><div class="wrap"><span class="st"><span>Signed in as '+esc(editUser||"editor")+'</span><span>Click any edit button on the page to open that item in the admin.</span></span><a class="btn btn-line btn-sm" href="'+ADMIN+'">Admin home</a><a class="btn btn-line btn-sm" href="'+ADMIN+'/collections/submissions">Inbox</a><a class="btn btn-line btn-sm" href="'+ADMIN+'/globals/settings">Site settings</a>'+(coll&&r.id?'<a class="btn btn-gold btn-sm" href="'+adminUrl("edit",coll,r.id)+'">Edit this page</a>':'<a class="btn btn-gold btn-sm" href="'+ADMIN+'/collections/news/create">+ New story</a>')+'<a class="btn btn-line btn-sm" href="'+ADMIN+'/logout">Sign out</a></div></div>';
}
function notfound(){ return phead("Not found","Page not found","The address may be wrong or the item may have been removed.",'<a class="btn btn-ink btn-sm" href="#home">Back to the home page</a>'); }
var RENDER = {home:home, about:about, excos:excos, reps:reps, academics:academics, tools:tools_page, community:community, newsletter:newsletter, merch:merch, departments:departments, news:newsPage, spotlight:spotlight, events:eventsPage, gallery:gallery, opportunities:opportunities, resources:resources, alumni:alumni, partner:partner, contact:contact, notfound:notfound};
function pageTitle(r){
  var S = state.settings, site = (S.short||"PESSA")+" UNILAG";
  if (r.p === "home") return site;
  if (r.id){
    var coll = {news:"news", events:"events", community:"articles", departments:"departments"}[r.p];
    var it = (state[coll]||[]).filter(function(x){return x.id===r.id;})[0];
    if (it) return (it.title||it.name||"")+" | "+site;
  }
  var pg = PAGES.filter(function(p){return p[0]===r.p;})[0];
  return (pg ? pg[1] : "Not found")+" | "+site;
}
function pageDescription(r){
  var S = state.settings;
  if (r.id){
    var coll = {news:"news", events:"events", community:"articles", departments:"departments"}[r.p];
    var it = (state[coll]||[]).filter(function(x){return x.id===r.id;})[0];
    if (it) return String(it.summary||it.description||it.about||it.citation||S.heroSub||"").slice(0,200);
  }
  var pg = PAGES.filter(function(p){return p[0]===r.p;})[0];
  return (pg && r.p!=="home" ? pg[1]+" · " : "")+String(S.heroSub||S.name||"");
}
function pageImage(r){
  var S = state.settings;
  if (r.id){
    var coll = {news:"news", events:"events", community:"articles", departments:"departments"}[r.p];
    var it = (state[coll]||[]).filter(function(x){return x.id===r.id;})[0];
    var im = it ? img(it.cover||it.poster||it.photo) : "";
    if (im) return im;
  }
  return img(S.heroImage) || img(S.logo) || "";
}
/** Render a full page body for a path. Used on the server and in the browser. */
function renderPage(path, st, opts){
  opts = opts || {};
  setState(st); PATH = path || "/"; editMode = !!opts.edit; editUser = opts.user || ""; ADMIN = opts.admin || "/admin";
  var r = route(), fn = RENDER[r.p] || notfound;
  var html = header(r.p) + '<main id="main">' + fn(r.id) + '</main>' + footer() + editBar();
  return {html: fixLinks(html), title: pageTitle(r), description: pageDescription(r), image: pageImage(r), status: r.p==="notfound" ? 404 : 200};
}
var API = {render: renderPage, pages: PAGES.map(function(p){return p[0];})};
if (typeof module !== "undefined" && module.exports) module.exports = API;
W.PESSA = API;

/* ---------- browser only ---------- */
var editUser = "";
var modal = {html:"", after:null};
var annClosed = false;
function openModal(title, body, foot, wide, after){modal.html = '<div class="ovl" data-act="ovl"><div class="modal'+(wide?' wide':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="mh"><h2>'+esc(title)+'</h2><button class="x" data-act="close" aria-label="Close">'+IC.x+'</button></div><div class="mb">'+body+'</div>'+(foot?'<div class="mf">'+foot+'</div>':'')+'</div></div>'; modal.after = after || null; render(true);}
function closeModal(){modal.html = ""; modal.after = null; render(true);}
function toast(msg){var t = DOC.createElement("div"); t.className = "toast"; t.setAttribute("role","status"); t.textContent = msg; DOC.body.appendChild(t); setTimeout(function(){t.remove();}, 3200);}

function render(keepScroll){
  if (!DOC || !root) return;
  var r = route(), y = W.scrollY;
  var fn = RENDER[r.p] || notfound;
  DOC.body.classList.toggle("editing", editMode);
  root.innerHTML = fixLinks(header(r.p) + '<main id="main">' + fn(r.id) + '</main>' + footer() + editBar() + (menuOpen ? drawer(r.p) : "")) + (modal.html || "");
  DOC.title = pageTitle(r);
  if (keepScroll) W.scrollTo(0, y);
  if (editMode) picButtons();
  if (DOC.getElementById("cgpa")) cgCalc();
  if (modal.after) modal.after();
  fx(!keepScroll);
}
function go(path, hash){
  menuOpen = false; modal.html = "";
  if (path !== PATH || true){ PATH = path; render(); }
  if (hash){ var el = DOC.getElementById(hash); if (el) el.scrollIntoView({behavior:"smooth", block:"start"}); else W.scrollTo(0,0); }
  else W.scrollTo(0,0);
}
/* photo edit buttons: open the item in the admin */
function picButtons(){
  DOC.querySelectorAll("#main [data-pic]").forEach(function(el){
    var par = el.parentElement; if (!par || par.querySelector(":scope > .pic-edit")) return;
    if (getComputedStyle(par).position === "static") par.style.position = "relative";
    var a = DOC.createElement("a"); a.className = "pic-edit"; var p = el.getAttribute("data-pic").split(":");
    a.href = adminUrl(p[0]==="settings"?"settings":"edit", p[0], p[1]);
    a.innerHTML = IC.edit + (el.tagName === "IMG" ? "Change photo" : "Add photo");
    par.appendChild(a);
  });
}
/* ---------- motion engine ---------- */
var fxState = {stop:null};
function fx(fresh){
  if (!DOC) return;
  var counters = DOC.querySelectorAll("[data-count]");
  if (!MOTION || !G) { counters.forEach(function(el){var n = +el.getAttribute("data-count"); if (n) el.textContent = n;}); var rg = DOC.querySelector(".ring .fg"); if (rg) rg.style.strokeDashoffset = String(339.3 * (1 - (+rg.getAttribute("data-pct")))); return; }
  if (W.ScrollTrigger) W.ScrollTrigger.getAll().forEach(function(t){t.kill();});
  G.killTweensOf("*");
  var main = DOC.getElementById("main");
  if (fresh){
    if (main) G.fromTo(main, {opacity:0, y:18}, {opacity:1, y:0, duration:.6, ease:"power3.out", clearProps:"transform"});
    var ws = DOC.querySelectorAll(".hero h1 .ln span");
    if (ws.length) G.fromTo(ws, {yPercent:110, rotate:4, opacity:0}, {yPercent:0, rotate:0, opacity:1, duration:.9, ease:"power4.out", stagger:.06, delay:.1, clearProps:"all"});
  }
  var seen = new Set();
  DOC.querySelectorAll(".rv").forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.top < W.innerHeight * .98){
      if (fresh && !seen.has(el.parentElement)){ seen.add(el.parentElement); var sib = Array.prototype.filter.call(el.parentElement.children, function(c){return c.classList.contains("rv") && c.getBoundingClientRect().top < W.innerHeight*.98;}); G.fromTo(sib, {y:24, opacity:0}, {y:0, opacity:1, duration:.8, ease:"power3.out", stagger:.07, delay:.12, clearProps:"transform"}); }
      return;
    }
    G.fromTo(el, {y:34, opacity:0}, {y:0, opacity:1, duration:.9, ease:"power3.out", clearProps:"transform", scrollTrigger:{trigger:el, start:"top 92%", once:true}});
  });
  counters.forEach(function(el){
    var n = +el.getAttribute("data-count"); if (!isFinite(n) || n === 0) return;
    if (!fresh){ el.textContent = n; return; }
    var o = {v:0};
    G.to(o, {v:n, duration:1.6, ease:"power2.out", scrollTrigger:{trigger:el, start:"top 95%", once:true}, onUpdate:function(){el.textContent = Math.round(o.v);}});
  });
  var ring = DOC.querySelector(".ring .fg");
  if (ring){ var p = +ring.getAttribute("data-pct"); setTimeout(function(){ring.style.strokeDashoffset = String(339.3 * (1 - p));}, 300); }
  var dl = DOC.querySelectorAll(".drawer .dl");
  if (dl.length) G.fromTo(dl, {y:30, opacity:0}, {y:0, opacity:1, duration:.7, ease:"power3.out", stagger:.04});
  var wipe = DOC.querySelectorAll(".wipe");
  if (wipe.length && fresh) G.fromTo(wipe, {clipPath:"inset(0 0 100% 0)"}, {clipPath:"inset(0 0 0% 0)", duration:1.4, ease:"power4.inOut", delay:.15, clearProps:"clipPath"});
  DOC.querySelectorAll(".glance .bgimg").forEach(function(o){
    G.fromTo(o, {yPercent:-8}, {yPercent:8, ease:"none", scrollTrigger:{trigger:o.parentElement, start:"top bottom", end:"bottom top", scrub:true}});
  });
}

/* ---------- public forms: stored in the admin inbox, emailed to PESSA ---------- */
var FORM_KIND = {nominate:"nomination", alumni:"alumni", contact:"contact", suggestion:"suggestion", sponsor:"sponsor"};
var FORM_TITLE = {nominate:"Spotlight nomination", alumni:"Alumni network registration", contact:"Message from the website", suggestion:"Suggestion box", sponsor:"Sponsorship enquiry"};
function formData(form){
  var data = {}, name = "", email = "", phone = "";
  form.querySelectorAll("input,select,textarea").forEach(function(el){
    if (!el.name || el.name === "website") return;
    var v = el.type === "checkbox" ? (el.checked ? "Yes" : "") : el.value.trim();
    if (!v) return;
    data[el.name] = v;
    if (/^(name|nominated by|contact person)$/i.test(el.name) && !name) name = v;
    if (/^nominee$/i.test(el.name) && !name) name = v;
    if (/email/i.test(el.name) && !email) email = v;
    if (/phone/i.test(el.name) && !phone) phone = v;
  });
  return {data:data, name:name, email:email, phone:phone};
}
function waLink(kind, data){
  var lines = ["*"+state.settings.short+" website: "+FORM_TITLE[kind]+"*"];
  Object.keys(data).forEach(function(k){ lines.push(k+": "+data[k]); });
  return "https://wa.me/"+digits(state.settings.waNumber)+"?text="+encodeURIComponent(lines.join("\n"));
}
async function submitForm(form){
  var kind = form.getAttribute("data-form"), out = form.querySelector(".out"), btn = form.querySelector('[type="submit"]');
  var fd = formData(form);
  if (!Object.keys(fd.data).length) return;
  if (btn){ btn.disabled = true; btn.textContent = "Sending..."; }
  out.innerHTML = "";
  try {
    var res = await fetch("/api/submissions", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({kind:FORM_KIND[kind], name:fd.name, email:fd.email, phone:fd.phone, data:fd.data, website:(form.querySelector('[name="website"]')||{}).value||""})});
    if (!res.ok) throw new Error("HTTP "+res.status);
    form.querySelectorAll("input,select,textarea").forEach(function(el){ if (el.type==="checkbox") el.checked = false; else if (el.tagName!=="SELECT") el.value = ""; });
    out.innerHTML = '<div class="result"><b>Sent. Thank you.</b><p class="muted" style="font-size:14.5px">The executives have received it'+(state.settings.waNumber?'. You can also send a copy on WhatsApp.':'.')+'</p>'+(state.settings.waNumber?'<div class="btns"><a class="btn btn-line btn-sm" href="'+waLink(kind, fd.data)+'" target="_blank" rel="noopener">Send on WhatsApp too</a></div>':'')+'</div>';
  } catch (e) {
    out.innerHTML = '<div class="result"><b>Could not send right now.</b><p class="muted" style="font-size:14.5px">Please try again, or send it on WhatsApp'+(state.settings.email?' or by email to '+esc(state.settings.email):'')+'.</p>'+(state.settings.waNumber?'<div class="btns"><a class="btn btn-gold btn-sm" href="'+waLink(kind, fd.data)+'" target="_blank" rel="noopener">Open WhatsApp</a></div>':'')+'</div>';
  }
  if (btn){ btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Send"; }
}
function copy(text, btn){
  var done = function(){ var o = btn.textContent; btn.textContent = "Copied"; setTimeout(function(){btn.textContent = o;}, 1600); };
  try { navigator.clipboard.writeText(text).then(done, function(){ fallbackCopy(text); done(); }); } catch(e){ fallbackCopy(text); done(); }
}
function fallbackCopy(text){var t = DOC.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; DOC.body.appendChild(t); t.select(); try{DOC.execCommand("copy");}catch(e){} t.remove();}

/* ---------- boot (browser) ---------- */
function boot(){
  root = DOC.getElementById("root");
  var el = DOC.getElementById("state"); if (!el) return;
  var boot = JSON.parse(el.textContent);
  setState(boot.state); editMode = !!boot.edit; editUser = boot.user || ""; ADMIN = boot.admin || "/admin";
  PATH = location.pathname;
  try { annClosed = sessionStorage.getItem("pessa-ann") === "1"; } catch(e){}
  W.addEventListener("scroll", function(){var h = DOC.getElementById("hdr"); if (h) h.classList.toggle("scrolled", W.scrollY > 40);}, {passive:true});
  W.addEventListener("popstate", function(){ PATH = location.pathname; menuOpen = false; modal.html = ""; render(); if (location.hash){ var t = DOC.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); } });
  DOC.addEventListener("click", function(e){
    var link = e.target.closest("a[href]");
    if (link && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && link.target !== "_blank" && !link.hasAttribute("download")){
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "/" && href.indexOf(ADMIN) !== 0 && href.indexOf("/api/") !== 0){
        var u = new URL(href, location.origin);
        e.preventDefault(); history.pushState(null, "", u.pathname + u.hash); go(u.pathname, u.hash.slice(1)); return;
      }
    }
    var a = e.target.closest("[data-act]"); if (!a) return;
    var act = a.getAttribute("data-act"), c = a.getAttribute("data-c"), id = a.getAttribute("data-id");
    if (act === "ovl"){ if (e.target === a) closeModal(); return; }
    if (act === "view-img"){ var g = state.gallery.filter(function(x){return x.id===id;})[0]; if (g) openModal(g.caption||g.event||"Photo", '<img class="lb" src="'+img(g.image)+'" alt="'+esc(g.caption)+'">'+(g.event||g.date?'<p class="muted" style="text-align:center">'+esc([g.event, fd(g.date)].filter(Boolean).join(" · "))+'</p>':''), "", true); return; }
    if (act === "view-spot"){ var s = state.spotlights.filter(function(x){return x.id===id;})[0]; if (s) openModal(spotTitle(s), '<div style="display:grid;grid-template-columns:200px minmax(0,1fr);gap:24px;align-items:start"><div style="width:200px">'+faceRound(s.photo,s.name)+'</div><div style="display:grid;gap:10px"><div class="period-tag '+(s.period||"Week").toLowerCase()+'" style="margin:0"><span>'+esc(s.kind)+'</span> of the <b>'+esc(s.period)+'</b></div>'+(s.kind!=="Department"&&s.category?'<div><span class="pill k">'+esc(s.category)+'</span></div>':'')+'<div class="dsp" style="font-size:28px">'+esc(s.name)+'</div><div class="serif" style="font-size:19px;color:var(--gold)">'+esc([s.kind==="Department"?"":s.department, s.level?s.level+" Level":""].filter(Boolean).join(" · "))+'</div><div class="prose" style="font-size:15.5px">'+paras(s.citation)+'</div>'+(s.handle?'<a class="more" href="https://instagram.com/'+encodeURIComponent(s.handle.replace(/^@/,""))+'" target="_blank" rel="noopener">@'+esc(s.handle.replace(/^@/,""))+'</a>':'')+'<div class="meta">'+esc(s.periodLabel||fd(s.date))+'</div></div></div>', "", true); return; }
    if (act === "close"){ closeModal(); return; }
    if (act === "menu"){ menuOpen = !menuOpen; render(true); return; }
    if (act === "copy"){ copy(a.getAttribute("data-v"), a); return; }
    if (act === "ann-close"){ annClosed = true; try{sessionStorage.setItem("pessa-ann","1");}catch(err){} render(true); return; }
    if (act === "cg-add"){ var cr = DOC.getElementById("cg-rows"); if (cr){ cr.insertAdjacentHTML("beforeend", courseRow()); cgCalc(); } return; }
    if (act === "cg-del"){ var row = a.closest(".cg-row"); if (row && DOC.querySelectorAll("#cg-rows .cg-row").length > 1){ row.remove(); cgCalc(); } return; }
    if (act === "cg-reset"){ var cr2 = DOC.getElementById("cg-rows"); if (cr2){ cr2.innerHTML = courseRow()+courseRow()+courseRow()+courseRow(); DOC.getElementById("cg-prev").value = ""; DOC.getElementById("cg-units").value = ""; cgCalc(); } return; }
    if (act === "filter"){ var gname = a.getAttribute("data-g"); ui[gname] = a.getAttribute("data-v"); if (gname === "spotKind") ui.spotCat = "All"; render(true); return; }
    if (!editMode) return;
    if (act === "add" || act === "edit" || act === "del" || act === "settings" || act === "manage" || act === "mgr"){ location.href = adminUrl(act, c, id); return; }
  });
  DOC.addEventListener("input", function(e){
    var el = e.target;
    if (el.closest && el.closest("#cgpa")) cgCalc();
    if (el.matches && el.matches("[data-tg]")) tgCalc();
  });
  DOC.addEventListener("change", function(e){
    var el = e.target;
    if (el.closest && el.closest("#cgpa")) cgCalc();
    if (el.matches("[data-nmkind]")){ var cat = DOC.querySelector("[data-nmcat]"); if (cat){ var cs = catsFor(el.value); cat.innerHTML = cs.length ? cs.map(function(c){return '<option>'+esc(c)+'</option>';}).join("") : '<option value="">Not applicable</option>'; cat.disabled = !cs.length; } return; }
    if (el.matches("[data-act-change]")){ ui[el.getAttribute("data-act-change")] = el.value; render(true); return; }
  });
  DOC.addEventListener("submit", function(e){
    var f = e.target.closest("form[data-form]"); if (!f) return;
    e.preventDefault(); var b = f.querySelector('[type="submit"]'); if (b && !b.getAttribute("data-label")) b.setAttribute("data-label", b.textContent); submitForm(f);
  });
  DOC.addEventListener("keydown", function(e){
    if (e.key === "Escape"){ if (modal.html){ closeModal(); } else if (menuOpen){ menuOpen = false; render(true); } }
  });
  render();
  if (location.hash){ var t = DOC.getElementById(location.hash.slice(1)); if (t) setTimeout(function(){t.scrollIntoView();}, 50); }
}
if (DOC && DOC.getElementById("root")) boot();
})();
