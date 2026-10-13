/* Reddy Lab website: draws every section from data/content.js. Content edits go in that file, not here. */
(function(){
  var D = window.SITE || {};
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function plain(s){ return String(s).replace(/[⁰-⁹⁺]/g, ""); }
  function ext(href, text){ return '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + text + '</a>'; }
  function set(id, html){ var el = $(id); if (el) el.innerHTML = html; }
  function initials(n){ return esc(String(n).split(/\s+/).filter(Boolean).map(function(w){ return w[0]; }).slice(0, 2).join("")); }

  /* Images that are listed but not yet in their folder fall back to a placeholder instead of a broken icon. */
  document.addEventListener("error", function(e){
    var t = e.target;
    if (t && t.tagName === "IMG" && t.hasAttribute("data-fallback")) {
      var span = document.createElement("span");
      span.className = t.getAttribute("data-fallback-class") || "todo";
      span.innerHTML = t.getAttribute("data-fallback");
      t.replaceWith(span);
    }
  }, true);
  function img(src, alt, fallback, cls, fbClass){
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"' + (cls ? ' class="' + cls + '"' : '') +
      ' data-fallback="' + esc(fallback) + '"' + (fbClass ? ' data-fallback-class="' + fbClass + '"' : '') + '>';
  }

  /* Emblem and species photos replace the drawn plants where a photo is listed. */
  var SP = D.speciesPhotos || {};
  if (D.emblem) {
    var em = document.querySelector(".emblem");
    if (em) { em.classList.add("has-photo"); em.innerHTML = '<img src="' + esc(D.emblem) + '" alt="">'; }
  }
  Object.keys(SP).forEach(function(k){
    [].slice.call(document.querySelectorAll('.sp-card[href="#sys-' + k + '"] svg, #sys-' + k + ' svg')).forEach(function(svg){
      var im = document.createElement("img");
      im.src = SP[k]; im.alt = svg.getAttribute("aria-label") || ""; im.className = "sp-photo"; im.loading = "lazy";
      svg.replaceWith(im);
    });
  });

  /* Google Scholar */
  var su = D.scholarUrl || (D.scholarId ? "https://scholar.google.com/citations?user=" + encodeURIComponent(D.scholarId) + "&hl=en" : "");
  if (su) {
    [].slice.call(document.querySelectorAll('a[href*="scholar.google.com/citations"]')).forEach(function(a){ a.href = su; });
  }

  /* ---------- Covers ---------- */
  var C = D.covers || [];
  function coverFig(c, i, cls){
    /* The moving band shows the cover alone; the labeled row underneath carries journal and issue. */
    var cap = cls === "mq-item cov" ? '' : '<figcaption><b>' + esc(c.journal) + '</b>' + esc(c.issue || "Issue details to add") + '</figcaption>';
    var art = img(c.file, c.journal + " cover", esc(c.journal), "", "todo");
    var inner = (cls === "cover" ? '<div class="frame">' + art + '</div>' : art) + cap;
    return '<figure class="' + cls + '">' + (c.link ? ext(c.link, inner) : inner) + '</figure>';
  }
  set("coverGrid", C.map(function(c, i){ return coverFig(c, i, "cover"); }).join(""));
  function loop(html){ return html + html.replace(/<figure /g, '<figure aria-hidden="true" '); }
  set("mqCovers", loop(C.map(function(c, i){ return coverFig(c, i, "mq-item cov"); }).join("")));

  /* Italicize species names inside plant art titles */
  var SPECIES = /(Arabidopsis thaliana|Arabidopsis|Sorghum bicolor|Oryza sativa|Nicotiana benthamiana|Chlamydomonas reinhardtii)/g;
  function sp(t){ return esc(t).replace(SPECIES, "<i>$1</i>"); }

  /* ---------- Plant Art ---------- */
  var A = D.plantArt || [];
  set("artGrid", A.map(function(a, i){
    var big = (i === 0 || a.big ? " big" : "") + (a.wide ? " wide" : "") + (a.full ? " full" : "") + (a.tall ? " tall" : "") + (a.fit === "contain" ? " contain" : "");
    var cap = '<figcaption><b>' + sp(a.title) + '</b>' + esc(a.caption) + (a.credit ? ' · ' + esc(a.credit) : '') + '</figcaption>';
    if (a.file) return '<figure class="tile' + big + '"' + (a.bg ? ' style="background:' + esc(a.bg) + '"' : '') + '>' + img(a.file, a.title, esc(a.title), "", "todo") + cap + '</figure>';
    if (a.plate) return '<figure class="tile' + big + '"' + (i === 0 ? ' style="--tint:var(--gold-soft)"' : '') + '><span class="plate">PLATE ' + (i + 1) + '</span><svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><use href="#' + esc(a.plate) + '"/></svg>' + cap + '</figure>';
    return '<figure class="tile slot' + (a.wide ? ' wide' : '') + '">' + esc(a.title) + (a.caption ? '<br>' + esc(a.caption) : '') + '</figure>';
  }).join(""));
  /* Moving Plant Art row: only the photos listed under plantArt.
     With three or more photos the row scrolls; with fewer it stands still, centered. */
  var artItems = A.filter(function(a){ return a.file; }).map(function(a){
    var bg = a.bg || (a.fit === "contain" ? "#000" : "");
    return '<figure class="mq-item pl photo' + (a.wide ? ' wide' : '') + (a.tall ? ' tall' : '') + '"' + (bg ? ' style="--mq-bg:' + esc(bg) + '"' : '') + '>' + img(a.file, a.title, "", "", "todo") + '<figcaption><b>' + sp(a.title) + '</b>' + (a.caption ? '<small>' + sp(a.caption) + '</small>' : '') + '</figcaption></figure>';
  });
  var mqEl = $("mqArt"), bandEl = document.querySelector(".marquee");
  if (!artItems.length) { if (bandEl) bandEl.hidden = true; }
  else if (artItems.length < 3) { if (mqEl) { mqEl.classList.add("still"); mqEl.innerHTML = artItems.join(""); } }
  else { var row = artItems; while (row.length < 8) row = row.concat(artItems); set("mqArt", loop(row.join(""))); }
  var band = bandEl, tg = $("mqToggle");
  if (tg && mqEl && mqEl.classList.contains("still")) tg.hidden = true;
  if (tg) tg.addEventListener("click", function(){ var p = band.classList.toggle("paused"); tg.setAttribute("aria-pressed", p); tg.textContent = p ? "Play" : "Pause"; });

  /* ---------- Publications ---------- */
  var P = D.publications || [];
  var LABEL = {ca:"Calcium", sp:"Splicing", mod:"Epitranscriptome", comp:"Computational", bio:"Plant Biotechnology", other:"Other"};
  var filt = "all", q = "";
  function renderPubs(){
    var ql = q.toLowerCase(), n = 0, html = "";
    P.forEach(function(p){
      var k = p.topics || [];
      if (filt !== "all" && k.indexOf(filt) < 0) return;
      if (ql && (p.title + " " + p.authors + " " + p.journal + " " + p.year).toLowerCase().indexOf(ql) < 0) return;
      n++;
      var gs = "https://scholar.google.com/scholar?q=" + encodeURIComponent('"' + plain(p.title) + '"');
      var pm = "https://pubmed.ncbi.nlm.nih.gov/?term=" + encodeURIComponent(plain(p.title));
      var primary = p.doi ? "https://doi.org/" + p.doi : (p.url || p.pdf || gs);
      var plabel = p.doi ? "Journal" : (p.url ? "Full text" : (p.pdf ? "PDF" : "Scholar"));
      var au = esc(p.authors).replace("Reddy ASN", "<b>Reddy ASN</b>");
      html += '<li class="pub"><span class="yr">' + esc(p.year) + '</span><div><div class="t">' + ext(primary, esc(p.title)) + '</div><div class="au">' + au +
        '</div><div class="meta"><span><span class="j">' + esc(p.journal) + '</span>' + (p.volume ? " " + esc(p.volume) : "") + '</span>' +
        k.map(function(t){ return '<span class="dot ' + t + '">' + LABEL[t] + '</span>'; }).join("") + (p.preprint ? '<span class="pre">Preprint</span>' : '') +
        '<span class="links">' + ext(primary, plabel + " ↗") + (p.pdf && primary !== p.pdf ? ext(p.pdf, "PDF ↗") : '') + (primary === gs ? ext(pm, "PubMed ↗") : ext(gs, "Scholar ↗")) + '</span></div></div></li>';
    });
    set("pubList", html || '<li class="pub"><span></span><div class="au">No papers match. Clear the search or choose another theme.</div></li>');
    if ($("pubCount")) $("pubCount").textContent = n + " of " + P.length + " papers";
  }
  if ($("pubN")) $("pubN").textContent = P.length;
  var chips = [].slice.call(document.querySelectorAll(".chip[data-f]"));
  function setF(f){ filt = f; chips.forEach(function(c){ c.setAttribute("aria-pressed", c.dataset.f === f ? "true" : "false"); }); renderPubs(); }
  chips.forEach(function(c){ c.addEventListener("click", function(){ setF(c.dataset.f); }); });
  if ($("pubSearch")) $("pubSearch").addEventListener("input", function(e){ q = e.target.value; renderPubs(); });
  [].slice.call(document.querySelectorAll("[data-filter]")).forEach(function(a){ a.addEventListener("click", function(){ setF(a.dataset.filter); }); });
  renderPubs();

  /* ---------- People ---------- */
  var pi = D.pi || {};
  set("piBlock",
    '<div class="portrait' + (pi.photo ? ' has-img' : '') + '">' + (pi.photo ? img(pi.photo, pi.name, "Portrait<br>(add to people/)", "", "todo") : 'Portrait<br>(add to people/)') + '</div>' +
    '<div><h3 style="font-size:1.7rem;margin:0px 0 10px">' + esc(pi.name) + '</h3>' +
    '<p>' + esc(pi.title) + '</p><p>' + esc(pi.bio) + '</p>' +
    (pi.email ? '<p class="mono" style="font-size:.85rem;color:var(--ink)">' + esc(pi.email) + ' <button class="copy" data-copy="' + esc(pi.email) + '">Copy</button></p>' : '') +
    ((pi.education || []).length || (pi.positions || []).length ?
      '<details class="cv"><summary>Education and career</summary>' +
      ((pi.positions || []).length ? '<h4>Positions</h4><ul class="rows">' + pi.positions.map(function(x){ return '<li><span class="k">' + esc(x.years) + '</span><span>' + esc(x.text) + '</span></li>'; }).join("") + '</ul>' : '') +
      ((pi.education || []).length ? '<h4>Education</h4><ul class="rows">' + pi.education.map(function(x){ return '<li><span class="k">' + esc(x.years) + '</span><span>' + esc(x.text) + '</span></li>'; }).join("") + '</ul>' : '') +
      '</details>' : '') + '</div>');
  var G = [["saps","Special Assistant Professors"],["postdocs","Postdoctoral fellows"],["grads","Graduate students"],["undergrads","Undergraduates"]];
  var people = D.people || {};
  set("peopleGroups", G.map(function(g){
    var list = people[g[0]] || [];
    /* Empty groups are hidden, with their menu links, until members are added */
    if (!list.length) { [].slice.call(document.querySelectorAll('a[href="#' + g[0] + '"]')).forEach(function(a){ a.hidden = true; }); return ""; }
    var body = list.length ? list.map(function(m){
      var face = m.photo ? img(m.photo, m.name, initials(m.name), "avatar", "avatar") : '<span class="avatar">' + initials(m.name) + '</span>';
      return '<div class="person">' + face + '<div><b>' + esc(m.name) + '</b><span>' + esc(m.title) + '</span><span>' + esc(m.project) + '</span></div></div>';
    }).join("") : '<p class="todo" style="margin-top:10px">To be added</p>';
    return '<div class="group" id="' + g[0] + '"><h3>' + g[1] + '</h3>' + body + '</div>';
  }).join(""));
  var al = people.alumni || [];
  /* Alumni: grouped, each group collapsible */
  var AG = ["Graduate students", "Postdoctoral fellows and Special Assistant Professors", "Visiting scholars", "Undergraduate researchers"];
  set("alumniBlock", al.length ? '<div class="alumni" id="alumni"><h3>Lab members</h3>' + AG.map(function(g){
    var list = al.filter(function(m){ return (m.group || "Graduate students") === g; });
    if (!list.length) return "";
    var compact = g === "Undergraduate researchers";
    var body = compact
      ? '<ul class="ug-list">' + list.map(function(m){ return '<li><b>' + esc(m.name) + '</b> <span>' + esc(m.years) + '</span></li>'; }).join("") + '</ul><p class="todo">Plus about 25 undergraduate laboratory assistants.</p>'
      : '<ul class="rows">' + list.map(function(m){ return '<li><span class="k">' + esc(m.years) + '</span><span><b>' + esc(m.name) + '</b>' + (m.title ? '<br>' + esc(m.title) : '') + (m.now ? '<br><span class="now">Now: ' + esc(m.now) + '</span>' : '') + '</span></li>'; }).join("") + '</ul>';
    return '<details class="al-group"><summary>' + esc(g) + ' <span class="count">' + list.length + '</span></summary>' + body + '</details>';
  }).join("") + '</div>' : '');
  set("collabList", (D.collaborators || []).map(function(c){ return '<div><b>' + esc(c.name) + '</b><span>' + esc(c.affiliation) + '</span></div>'; }).join(""));

  /* ---------- Impact numbers ---------- */
  var IM = D.impact;
  if (IM && $("impactStats")) {
    set("impactStats", [[IM.papers, "Peer-reviewed papers and reviews"], [IM.citations, "Citations"], [IM.hindex, "h-index"]]
      .filter(function(x){ return x[0]; }).map(function(x){ return '<div><span class="stat">' + esc(x[0]) + '</span><small>' + x[1] + '</small></div>'; }).join("") +
      '');
  }

  /* ---------- Simple lists ---------- */
  function rows(list, key, body, emptyText){
    return list.length ? list.map(function(x){ return '<li><span class="k">' + esc(key(x)) + '</span><span>' + body(x) + '</span></li>'; }).join("")
                       : '<li class="empty"><span class="k"></span><span>' + emptyText + '</span></li>';
  }
  /* Funding: agency names only */
  set("fundingList", (D.funding || []).map(function(a){
    var name = typeof a === "string" ? a : (a.name || a.agency);
    /* Logo sits to the left of the name; rows without a logo keep an empty slot so all names line up. */
    var logo = typeof a === "object" && a.logo ? '<span class="ag-logo">' + img(a.logo, name + " logo", "", "", "todo") + '</span>' : '<span class="ag-logo empty" aria-hidden="true"></span>';
    return '<li>' + logo + '<span class="ag-name">' + esc(name) + '</span></li>';
  }).join("") || '<li class="todo">Agencies to be added</li>');
  set("courseList", rows(D.courses || [], function(c){ return c.number; },
    function(c){ return esc(c.title) + (c.level || c.terms ? '<br><span class="todo" style="font-style:normal">' + esc([c.level, c.terms].filter(Boolean).join(" · ")) + '</span>' : ''); }, "Courses to be added"));
  set("honorList", rows(D.honors || [], function(h){ return h.year; }, function(h){ return esc(h.text); }, "Honors to be added"));
  set("talkList", rows(D.talks || [], function(t){ return t.date; },
    function(t){ return (t.link ? ext(t.link, esc(t.title)) : esc(t.title)) + '. ' + esc([t.venue, t.city].filter(Boolean).join(", ")) + '.'; }, "Talks to be added"));
  set("newsList", rows(D.news || [], function(n){ return n.date; }, function(n){ return n.link ? ext(n.link, esc(n.title)) : esc(n.title); }, "News to be added"));

  /* ---------- Service tabs ---------- */
  var SV = D.service || {};
  var S = [
    ["committees","Committees","University, College and Department committees."],
    ["gradcomm","Graduate committees","Students advised and graduate committees served."],
    ["society","Society service","Roles in professional societies."],
    ["panels","Panels","Grant review panels."],
    ["reviewer","Reviewer of journals","Ad hoc reviewing for journals and funding agencies."],
    ["editorial","Editorial responsibilities","Editorial board memberships and editorships."],
    ["books","Edited books and special issues","Edited volumes and journal special issues."]
  ];
  var tabs = $("svcTabs"), panel = $("svcPanel");
  S.forEach(function(s, i){
    var b = document.createElement("button"); b.className = "chip"; b.setAttribute("role", "tab"); b.textContent = s[1];
    b.addEventListener("click", function(){ showS(i); }); tabs.appendChild(b);
  });
  function showS(i){
    [].slice.call(tabs.children).forEach(function(b, j){ b.setAttribute("aria-pressed", j === i ? "true" : "false"); b.setAttribute("aria-selected", j === i ? "true" : "false"); });
    var list = SV[S[i][0]] || [];
    var hint = S[i][2] + (list.length > 12 ? ' ' + list.length + ' entries.' : '');
    var item = function(x){ return '<b>' + esc(x.org) + '</b>' + (x.role ? '<br>' + esc(x.role) : ''); };
    var html;
    if (list.some(function(x){ return x.level; })) {
      html = ["University", "College", "Department"].map(function(lv){
        var sub = list.filter(function(x){ return x.level === lv; });
        return sub.length ? '<h4 class="lv">' + lv + '</h4><ul class="rows">' + rows(sub, function(x){ return x.years; }, function(x){ return '<b>' + esc(x.role) + '</b><br>' + esc(x.org); }, "") + '</ul>' : '';
      }).join("");
    } else {
      html = '<ul class="rows">' + rows(list, function(x){ return x.years || ""; }, item, "Entries to be added") + '</ul>';
    }
    panel.innerHTML = '<h3>' + S[i][1] + '</h3><p class="hint">' + hint + '</p>' + html;
  }
  showS(0);

  /* ---------- Photos ---------- */
  var PH = D.photos || [];
  set("photoGrid", PH.length ? PH.map(function(p){
    return '<figure class="art photo">' + img(p.file, p.title, esc(p.title), "", "pic") + '<figcaption><b>' + esc(p.title) + '</b>' + esc(p.caption) + '</figcaption></figure>';
  }).join("") : ["Lab group","Meeting","Field day"].map(function(t){ return '<figure class="art empty"><div class="pic">' + t + ' photo</div><figcaption><b>' + t + '</b>To be added</figcaption></figure>'; }).join(""));

  /* ---------- Movies ---------- */
  var playSvg = '<svg class="play" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(0,0,0,.45)" stroke="#fff" stroke-width="2"/><path d="M26 20 L46 32 L26 44z" fill="#fff"/></svg>';
  set("movieGrid", (D.movies || []).map(function(m, i){
    var cap = '<figcaption><b>' + esc(m.title) + '</b>' + esc(m.description) + (!m.file && !m.link ? '<br><span class="todo">Movie to be added</span>' : '') + '</figcaption>';
    if (m.file) return '<figure class="movie"><video controls preload="metadata" playsinline' + (m.loop ? ' loop' : '') + ' src="' + esc(m.file) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : '') + '></video>' + cap + '</figure>';
    var poster = '<div class="poster p' + ((i % 4) + 1) + '"' + (m.poster ? ' style="background:url(\'' + esc(m.poster) + '\') center/cover"' : '') + '>' + playSvg + (m.length ? '<span class="dur">' + esc(m.length) + '</span>' : '') + '</div>';
    return '<figure class="movie">' + (m.link ? ext(m.link, poster + cap) : poster + cap) + '</figure>';
  }).join(""));

  /* ---------- Hero figure switch: calcium signaling / pre-mRNA splicing ---------- */
  var figTabs = [].slice.call(document.querySelectorAll(".fig-tab"));
  figTabs.forEach(function(t){
    t.addEventListener("click", function(){
      figTabs.forEach(function(o){ var on = o === t; o.setAttribute("aria-selected", on ? "true" : "false"); var pnl = $(o.getAttribute("aria-controls")); if (pnl) pnl.hidden = !on; });
    });
  });

  /* ---------- Navigation: tap-to-open dropdowns plus hover on desktop ---------- */
  var mb = $("menuBtn"), nav = $("nav");
  var dds = [].slice.call(nav.querySelectorAll(".dd"));
  function closeAll(except){ dds.forEach(function(d){ if (d !== except) { d.classList.remove("open"); d.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); } }); }
  dds.forEach(function(d){ var b = d.querySelector(".dd-btn"); b.addEventListener("click", function(e){ e.stopPropagation(); var o = !d.classList.contains("open"); closeAll(d); d.classList.toggle("open", o); b.setAttribute("aria-expanded", o); }); });
  document.addEventListener("click", function(e){ if (!nav.contains(e.target) && e.target !== mb) closeAll(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") { closeAll(); nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); } });
  mb.addEventListener("click", function(){ var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  nav.addEventListener("click", function(e){ if (e.target.closest("a")) { closeAll(); nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); } });

  /* Deep links: #pubs-ca, #pubs-sp filter papers; #svc-<name> opens a service tab */
  /* Publications stay off the home page; they open only from a Publications link and close on any other link. */
  var pubSec = $("publications");
  function showPubs(on){ if (pubSec) pubSec.hidden = !on; }
  function route(){
    var h = location.hash.slice(1);
    var isPub = h === "publications" || h.indexOf("pubs-") === 0;
    showPubs(isPub);
    /* News coverage and invited talks stay hidden; they open only from the Talks link in the Research menu. */
    /* Masked for now: set SHOW_NEWS to true to let the Talks link open this section again. */
    var SHOW_NEWS = false;
    var newsSec = $("news"); if (newsSec) newsSec.hidden = !(SHOW_NEWS && (h === "talks" || h === "news"));
    /* The home page shows covers, PI, research and Science as Art. Other sections (class "subpage") open only from the menu. */
    var hit = h ? document.getElementById(h) : null;
    var sub = hit && hit.closest ? hit.closest(".subpage") : null;
    [].slice.call(document.querySelectorAll(".subpage")).forEach(function(sec){ sec.hidden = sec !== sub; });
    if (!h) return;
    var t = null;
    if (h === "publications") { setF("all"); t = pubSec; }
    else if (h.indexOf("pubs-") === 0) { var f = h.slice(5); if (LABEL[f]) { setF(f); t = pubSec; } }
    else if (h.indexOf("svc-") === 0) { var k = h.slice(4); for (var i = 0; i < S.length; i++) { if (S[i][0] === k) { showS(i); t = $("service"); } } }
    else if (h === "home") { t = null; setTimeout(function(){ try { window.scrollTo({top: 0, behavior: "instant"}); } catch (e) { window.scrollTo(0, 0); } }, 30); }
    else { t = document.getElementById(h); }
    if (t) t.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  }
  window.addEventListener("hashchange", route); route();

  /* Copy email */
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-copy]"); if (!b) return;
    var done = function(){ b.textContent = "Copied"; setTimeout(function(){ b.textContent = "Copy"; }, 1500); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, function(){}); } catch (err) {}
  });
})();
