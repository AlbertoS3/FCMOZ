/* FCMOZ v1.0 — frontend. Fontes RSS públicas são tentadas via RSS2JSON; o serviço externo pode ter limites. */
const $ = (s) => document.querySelector(s);
const demoNews = [
 {type:"news",category:"NOTÍCIA",title:"Acompanha as atualizações oficiais do FC Mobile",description:"Consulta as notas de atualização e os anúncios oficiais para saber o que mudou no jogo.",date:new Date().toISOString(),url:"https://www.ea.com/games/ea-sports-fc/fc-mobile",symbol:"⚽",demo:true},
 {type:"event",category:"GUIA",title:"Como acompanhar os eventos dentro do jogo",description:"Abre a área de eventos, verifica os objetivos diários e confirma as datas diretamente no FC Mobile.",date:new Date().toISOString(),url:"https://www.ea.com/games/ea-sports-fc/fc-mobile",symbol:"✦",demo:true},
 {type:"codes",category:"CÓDIGOS",title:"Confirma sempre os códigos antes de resgatar",description:"Os códigos podem expirar ou ter restrições. Usa o portal oficial e não partilhes a tua palavra-passe.",date:new Date().toISOString(),url:"https://redeem.fcm.ea.com/",symbol:"🎁",demo:true}
];
const state={news:[],filter:"all"};
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatDate(value){const d=new Date(value);return Number.isNaN(d.getTime())?"Data não indicada":new Intl.DateTimeFormat("pt-MZ",{day:"2-digit",month:"short",year:"numeric"}).format(d);}
function categoryFrom(item){const text=((item.title||"")+" "+(item.description||"")).toLowerCase();if(/code|código|redeem|resgate/.test(text))return "codes";if(/event|evento|season|temporada|challenge|desafio/.test(text))return "event";return "news";}
function shortDescription(s=""){const clean=String(s).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();return clean.length>170?clean.slice(0,167)+"…":clean||"Abre a fonte para ler mais detalhes desta publicação.";}
function renderNews(){
 const list=state.news.filter(n=>state.filter==="all"||n.type===state.filter);
 $("#newsGrid").innerHTML=list.map(n=>`<article class="news-card"><div class="news-thumb"><span class="thumb-symbol">${escapeHTML(n.symbol||"⚽")}</span><span class="news-badge">${escapeHTML(n.category||"NOVIDADE")}</span></div><div class="news-content"><div class="news-date">${escapeHTML(formatDate(n.date))}${n.source?` · ${escapeHTML(n.source)}`:""}</div><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(shortDescription(n.description))}</p><a class="news-link" href="${safeURL(n.url)}" target="_blank" rel="noopener noreferrer">LER NA FONTE ↗</a></div></article>`).join("")||'<div class="empty-state"><b>Não há publicações nesta categoria.</b><p>Tenta outra categoria.</p></div>';
}
function safeURL(value){try{const u=new URL(value||"https://www.ea.com/games/ea-sports-fc/fc-mobile");return ["https:","http:"].includes(u.protocol)?escapeHTML(u.href):"#";}catch{return "#";}}
async function fetchFeed(){
 $("#feedStatus").textContent="A procurar publicações recentes em fontes públicas…";
 // Feeds oficiais/públicos. RSS2JSON é um intermediário externo gratuito sujeito a limites/indisponibilidade.
 const feeds=[
  {url:"https://www.ea.com/news/rss",source:"EA News"},
  {url:"https://www.ea.com/games/ea-sports-fc/fc-mobile/news",source:"EA SPORTS FC Mobile"}
 ];
 let loaded=[];
 for(const feed of feeds){
  try{
   const endpoint="https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(feed.url);
   const res=await fetch(endpoint,{signal:AbortSignal.timeout(7000)});
   if(!res.ok)continue;
   const data=await res.json();
   if(data.status!=="ok"||!Array.isArray(data.items))continue;
   const items=data.items.map(i=>({type:categoryFrom(i),category:categoryFrom(i)==="event"?"EVENTO":categoryFrom(i)==="codes"?"CÓDIGO":"NOTÍCIA",title:i.title||"Atualização",description:i.description||i.content||"",date:i.pubDate||new Date().toISOString(),url:i.link,source:feed.source,symbol:categoryFrom(i)==="event"?"✦":categoryFrom(i)==="codes"?"🎁":"⚽"})).filter(i=>i.url&&i.title);
   loaded.push(...items);
  }catch(e){/* uma fonte indisponível não deve impedir as outras */ }
 }
 const unique=[...new Map(loaded.map(n=>[n.url,n])).values()].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,9);
 if(unique.length){state.news=unique;$("#feedStatus").textContent=`${unique.length} publicações encontradas em feeds públicos. Confirma sempre a fonte original.`;}
 else{state.news=demoNews;$("#feedStatus").textContent="Não foi possível carregar feeds externos agora. A mostrar cartões informativos de demonstração — não são notícias de última hora.";}
 renderNews();
}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2400);}
const COMMENT_KEY="fcmoz_comments_v1";
function getComments(){try{const val=JSON.parse(localStorage.getItem(COMMENT_KEY)||"[]");return Array.isArray(val)?val:[]}catch{return[]}}
function renderComments(){
 const comments=getComments();$("#commentCount").textContent=`${comments.length} ${comments.length===1?"comentário":"comentários"}`;
 $("#commentsList").innerHTML=comments.length?comments.map(c=>`<article class="comment-item"><strong>${escapeHTML(c.name)}</strong><time>${escapeHTML(formatDate(c.date))}</time><p>${escapeHTML(c.text)}</p></article>`).join(""):'<p class="empty-comments">Sê o primeiro a comentar.</p>';
}
$("#commentText").addEventListener("input",e=>$("#charCount").textContent=`${e.target.value.length}/500`);
$("#commentForm").addEventListener("submit",e=>{
 e.preventDefault();const name=$("#commentName").value.trim().slice(0,30),text=$("#commentText").value.trim().slice(0,500);
 if(!name||!text){toast("Preenche o nome e o comentário.");return;}
 const comments=getComments();comments.unshift({name,text,date:new Date().toISOString()});
 try{localStorage.setItem(COMMENT_KEY,JSON.stringify(comments.slice(0,100)));}catch{toast("Não foi possível guardar. Verifica o armazenamento do navegador.");return;}
 $("#commentText").value="";$("#charCount").textContent="0/500";renderComments();toast("Comentário guardado neste dispositivo.");
});
$("#newsFilters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;state.filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderNews();});
$("#refreshNews").addEventListener("click",fetchFeed);
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));$("#menuToggle").textContent=open?"✕":"☰";});
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");$("#menuToggle").textContent="☰";document.querySelectorAll(".nav-link").forEach(x=>x.classList.toggle("active",x===a));}));
$("#todayLabel").textContent="EDIÇÃO "+new Intl.DateTimeFormat("pt-MZ",{month:"short",year:"numeric"}).format(new Date()).toUpperCase();
renderComments();fetchFeed();
