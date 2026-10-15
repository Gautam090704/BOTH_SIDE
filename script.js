// ---------- 1. Topics ----------
// To add a topic, add one more line here.
var topics = [
  {id:"hw", q:"Should homework be banned in schools?", short:"Homework"},
  {id:"sm", q:"Should social media have a minimum age of 16?", short:"Social media"},
  {id:"att", q:"Should college attendance be optional?", short:"Attendance"},
  {id:"ev", q:"Should new petrol cars be banned by 2035?", short:"Electric cars"},
  {id:"wk", q:"Should the work week be four days long?", short:"Work week"},
  {id:"ex", q:"Should board exams be replaced by continuous assessment?", short:"Exams"}
];

// ---------- 2. Sample editorials ----------
// s = stance ("yes" or "no"), t = headline, b = body, n = writer name
var data = {
  hw: [
    {s:"yes", t:"Learning shouldn't follow children home", b:"Six hours in class is already a full working day. Homework cuts into sleep, play, and family time, and it rewards the students whose homes are quiet and well supplied. Better schools use class time well and let evenings belong to the child.", n:"Riya S."},
    {s:"no", t:"Practice at home builds the habit of studying", b:"Nobody learns maths or writing from lectures alone. Short, focused homework turns what was heard in class into skill, and it teaches planning and self-discipline that exams and jobs demand later. Fix bad homework, don't ban the good kind.", n:"Aman K."}
  ],
  sm: [
    {s:"yes", t:"A feed built to hook a child is not a fair fight", b:"Platforms are designed to maximise time spent, and teenagers have the least defence against that design. A clear age limit gives parents backing and gives companies a reason to build safer products.", n:"Neha P."},
    {s:"no", t:"Bans push teens to lie, not to log off", b:"Age checks are easy to dodge, so a ban mostly teaches young people to hide their use from adults. Teaching media skills and giving parents better controls protects more children than a number on a form.", n:"Dev M."}
  ],
  att: [
    {s:"yes", t:"Treat students as adults and measure what they learn", b:"If a student can pass the exam without sitting through every lecture, forced attendance only measures obedience. Optional attendance rewards results and pushes teachers to make classes worth attending.", n:"Kabir T."},
    {s:"no", t:"Classrooms teach what notes never can", b:"Discussion, labs, and questions asked in the moment are most of the value of college. Make attendance optional and the students who most need structure are the first to fall behind.", n:"Sana R."}
  ]
};

// ---------- 3. App state ----------
var cur = "hw";      // current topic id
var filt = "all";    // "yes", "no" or "all"
var stance = "";     // stance chosen in the write form
var term = "";       // search text

// Demo like counts for the sample editorials
var seedL = {hw0:312, hw1:874, sm0:205, sm1:468, att0:96, att1:641};
Object.keys(data).forEach(function(k){
  data[k].forEach(function(a, i){ a.id = k + i; a.l = seedL[a.id] || 0; });
});

// Load likes and posts saved in this browser
var liked = {};
try { liked = JSON.parse(localStorage.getItem("bothsides-likes") || "{}"); } catch(e) {}
try {
  var saved = JSON.parse(localStorage.getItem("bothsides-posts") || "null");
  if (saved) {
    Object.keys(saved).forEach(function(k){ data[k] = (data[k] || []).concat(saved[k]); });
  }
} catch(e) {}

// ---------- 4. Helpers ----------
// Stops user text from being treated as HTML
function esc(s){
  return s.replace(/[&<>"]/g, function(c){
    return {"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"}[c];
  });
}
function words(s){
  var m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

// ---------- 5. Drawing the page ----------
function renderTopics(){
  var h = "";
  topics.forEach(function(t){
    if (term && (t.q + " " + t.short).toLowerCase().indexOf(term) < 0) return;
    h += '<button data-t="' + t.id + '" aria-pressed="' + (t.id === cur) + '">' + t.short + '</button>';
  });
  if (!h) { h = '<span class="by">No topics match. Try another word.</span>'; }
  document.getElementById("topics").innerHTML = h;
}

function renderList(){
  var t = topics.filter(function(x){ return x.id === cur; })[0];
  document.getElementById("q").textContent = t.q;

  var all = data[cur] || [];
  var items = all.filter(function(a){ return filt === "all" || a.s === filt; });
  var y = all.filter(function(a){ return a.s === "yes"; }).length;
  var n = all.length - y;
  document.getElementById("count").textContent = y + " yes, " + n + " no";

  var h = "";
  items.forEach(function(a){
    h += '<article class="card ' + a.s + '">' +
         '<span class="pill ' + a.s + '">' + (a.s === "yes" ? "Yes" : "No") + '</span>' +
         '<h3>' + esc(a.t) + '</h3><p>' + esc(a.b) + '</p>' +
         '<div class="foot"><span class="by">By ' + esc(a.n) + '</span>' +
         '<button class="like" data-id="' + a.id + '" aria-pressed="' + !!liked[a.id] + '" aria-label="Like this editorial">&#9829; ' +
         ((a.l || 0) + (liked[a.id] ? 1 : 0)).toLocaleString() + '</button></div></article>';
  });
  if (!items.length) {
    h = '<div class="empty">No ' + (filt === "yes" ? "yes" : "no") + ' editorials on this topic yet. Be the first to write one.</div>';
  }
  document.getElementById("list").innerHTML = h;

  ["yes", "no", "all"].forEach(function(f){
    document.querySelector('#seg [data-f="' + f + '"]').setAttribute("aria-pressed", String(filt === f));
  });
}

// ---------- 6. Clicks and typing ----------
// Choose a topic
document.getElementById("topics").addEventListener("click", function(e){
  var b = e.target.closest("button"); if (!b) return;
  cur = b.dataset.t; renderTopics(); renderList();
});

// Yes only / No only / Both
document.getElementById("seg").addEventListener("click", function(e){
  var b = e.target.closest("button"); if (!b) return;
  filt = b.dataset.f; renderList();
});

// Search topics
document.getElementById("search").addEventListener("input", function(e){
  term = e.target.value.trim().toLowerCase(); renderTopics();
});

// Like button
document.getElementById("list").addEventListener("click", function(e){
  var b = e.target.closest(".like"); if (!b) return;
  var id = b.dataset.id;
  if (liked[id]) { delete liked[id]; } else { liked[id] = true; }
  try { localStorage.setItem("bothsides-likes", JSON.stringify(liked)); } catch(x) {}
  renderList();
});

// Choose stance in the write form
document.getElementById("stance").addEventListener("click", function(e){
  var b = e.target.closest("button"); if (!b) return;
  stance = b.dataset.s;
  ["yes", "no"].forEach(function(s){
    document.querySelector('#stance [data-s="' + s + '"]').setAttribute("aria-pressed", String(stance === s));
  });
  document.getElementById("err").textContent = "";
});

// Word counter
var body = document.getElementById("body");
body.addEventListener("input", function(){
  document.getElementById("wc").textContent = words(body.value) + " words";
  document.getElementById("err").textContent = "";
});

// ---------- 7. Publishing an editorial ----------
document.getElementById("post").addEventListener("click", function(){
  var err = document.getElementById("err");
  var title = document.getElementById("title").value.trim();

  if (!stance) { err.textContent = "Choose Yes or No for your stance."; return; }
  if (!title) { err.textContent = "Add a headline."; return; }
  if (words(body.value) < 40) {
    err.textContent = "Write at least 40 words. You have " + words(body.value) + ".";
    return;
  }

  var name = document.getElementById("name").value.trim() || "Anonymous";
  var post = {s:stance, t:title, b:body.value.trim(), n:name, id:"u" + Date.now(), l:0};
  (data[cur] = data[cur] || []).unshift(post);

  try {
    var sv = JSON.parse(localStorage.getItem("bothsides-posts") || "{}");
    sv[cur] = [post].concat(sv[cur] || []);
    localStorage.setItem("bothsides-posts", JSON.stringify(sv));
  } catch(e) {}

  // Clear the form
  document.getElementById("title").value = "";
  body.value = "";
  document.getElementById("wc").textContent = "0 words";
  stance = "";
  ["yes", "no"].forEach(function(s){
    document.querySelector('#stance [data-s="' + s + '"]').setAttribute("aria-pressed", "false");
  });

  filt = "all";
  renderList();
  document.getElementById("list").scrollIntoView({behavior:"smooth", block:"start"});
});

// ---------- 8. Start ----------
renderTopics();
renderList();