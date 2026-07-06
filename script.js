/* ====================== APP STATE ====================== */
const App = {
  history: ['splash'],
  user: { name:'Daniel Okafor', tag:'@danielok', acct:'8821 0046 7732', wallet:'VLA-209384-NG' },
  balances: { available: 248650.75, savings: 1320400.00, cashback: 4250.00, points: 1280 },
  pin: '',
  amount: '',
  selectedRecipient: null,
  selectedBill: null,
  cardFrozen: false,
};

function go(screenId, opts){
  opts = opts || {};
  const current = document.querySelector('.screen.active');
  const next = document.getElementById('screen-'+screenId);
  if(!next){ console.warn('Missing screen', screenId); return; }
  if(current) current.classList.remove('active');
  next.classList.add('active');
  if(!opts.replace){ App.history.push(screenId); }
  // bottom nav visibility
  const mainScreens = ['home','cards-hub','bills-hub','settings','finance-hub'];
  const nav = document.getElementById('bottomNav');
  if(mainScreens.includes(screenId)){ nav.classList.add('show'); } else { nav.classList.remove('show'); }
  document.querySelectorAll('.nav-item[data-go]').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.go === screenId);
  });
  next.querySelector('.screen-scroll')?.scrollTo(0,0);
  if(opts.onEnter) opts.onEnter();
}
function back(){
  App.history.pop();
  const prev = App.history[App.history.length-1] || 'home';
  go(prev, {replace:true});
}
function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}
function openSheet(id){ document.getElementById(id).classList.add('show'); }
function closeSheet(id){ document.getElementById(id).classList.remove('show'); }

document.addEventListener('click', (e)=>{
  const navBtn = e.target.closest('.nav-item[data-go]');
  if(navBtn){ go(navBtn.dataset.go); }
  const backBtn = e.target.closest('[data-back]');
  if(backBtn){ back(); }
  const goBtn = e.target.closest('[data-goto]');
  if(goBtn){ go(goBtn.dataset.goto); }
});

// live clock
function tick(){
  const d = new Date();
  document.getElementById('clock').textContent = d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:false});
}
tick(); setInterval(tick, 30000);

// splash auto-advance
setTimeout(()=>{ go('onboard-1', {replace:true}); }, 2200);

/* ====================== DATA-DRIVEN RENDERERS ====================== */
const quickActions = [
  {label:'Send Money', icon:'north_east', go:'send-money'},
  {label:'Receive', icon:'south_west', go:'receive'},
  {label:'Airtime', icon:'phone_iphone', go:'bill-pay', bill:['Airtime','phone_iphone']},
  {label:'Data Bundle', icon:'wifi', go:'bill-pay', bill:['Data Bundle','wifi']},
  {label:'Electricity', icon:'bolt', go:'bill-pay', bill:['Electricity','bolt']},
  {label:'Cards', icon:'credit_card', go:'cards-hub'},
  {label:'Cash Agent', icon:'storefront', go:'cash-deposit-withdraw'},
  {label:'All Bills', icon:'grid_view', go:'bills-hub'},
];
function renderQuickActions(){
  const el = document.getElementById('quickActions');
  if(!el) return;
  el.innerHTML = quickActions.map(a=>{
    const billAttr = a.bill ? `onclick="openBill('${a.bill[0]}','${a.bill[1]}')"` : `data-goto="${a.go}"`;
    return `<button class="grid-icon-item" ${billAttr}><div class="ic"><span class="material-symbols-rounded" style="color:var(--green);">${a.icon}</span></div><span class="lbl">${a.label}</span></button>`;
  }).join('');
}

const weekData = [40,65,38,80,55,95,70];
function renderChart(){
  const el = document.getElementById('chartBars');
  if(!el) return;
  el.innerHTML = weekData.map((v,i)=>{
    const isMax = v === Math.max(...weekData);
    return `<div style="flex:1; height:${v}%; border-radius:7px 7px 3px 3px; background:${isMax?'var(--grad)':'var(--surface-2)'};"></div>`;
  }).join('');
}

const recentTxns = [
  {name:'Chiamaka Eze', sub:'Wallet transfer · received', amt:'+₦45,000', dir:'in', icon:'south_west', time:'2:30 PM'},
  {name:'Netflix Subscription', sub:'Card payment', amt:'-₦4,500', dir:'out', icon:'north_east', time:'11:02 AM'},
  {name:'IKEDC Electricity', sub:'Bill payment · processing', amt:'-₦5,000', dir:'out', icon:'bolt', time:'Yesterday'},
  {name:'Tunde Johnson', sub:'Bank transfer · Access Bank', amt:'-₦12,000', dir:'out', icon:'north_east', time:'Yesterday'},
];
function renderRecentTxns(){
  const el = document.getElementById('recentTxnList');
  if(!el) return;
  el.innerHTML = recentTxns.map((t,i)=>`
    <div class="list-item" data-goto="transaction-details">
      <div class="ic" style="background:${t.dir==='in'?'var(--green-soft)':'var(--surface-2)'};"><span class="material-symbols-rounded" style="font-size:20px; color:${t.dir==='in'?'var(--green)':'var(--text-1)'};">${t.icon}</span></div>
      <div class="meta"><div class="t1">${t.name}</div><div class="t2">${t.sub}</div></div>
      <div class="end"><div class="v1" style="color:${t.dir==='in'?'var(--green)':'var(--text-1)'};">${t.amt}</div><div class="v2">${t.time}</div></div>
    </div>${i<recentTxns.length-1?'<div class="divider" style="margin:4px 0;"></div>':''}`).join('');
}

const recipients = [
  {name:'Chiamaka Eze', sub:'8102 9934 410 · GTBank', init:'CE'},
  {name:'Tunde Johnson', sub:'0223 8810 221 · Access Bank', init:'TJ'},
  {name:'Amaka Bello', sub:'1029 4471 003 · Zenith Bank', init:'AB'},
  {name:'Emeka Obi', sub:'VLA-771029-NG · Vela Wallet', init:'EO'},
  {name:'Grace Adeyemi', sub:'0091 2234 887 · UBA', init:'GA'},
];
function renderRecipients(){
  const el = document.getElementById('recipientList');
  if(!el) return;
  el.innerHTML = recipients.map((r,i)=>`
    <div class="list-item" data-goto="send-amount">
      <div class="avatar" style="border-radius:50%;">${r.init}</div>
      <div class="meta"><div class="t1">${r.name}</div><div class="t2">${r.sub}</div></div>
      <span class="material-symbols-rounded" style="color:var(--text-3);">chevron_right</span>
    </div>${i<recipients.length-1?'<div class="divider" style="margin:4px 0;"></div>':''}`).join('');
}

const billCategories = [
  {label:'Airtime', icon:'phone_iphone'},
  {label:'Data Bundle', icon:'wifi'},
  {label:'Electricity', icon:'bolt'},
  {label:'Cable TV', icon:'live_tv'},
  {label:'Internet', icon:'router'},
  {label:'Education', icon:'school'},
  {label:'Betting', icon:'casino'},
  {label:'Water Bill', icon:'water_drop'},
  {label:'Waste Bill', icon:'delete'},
];
function renderBillsGrid(){
  const el = document.getElementById('billsGrid');
  if(!el) return;
  el.innerHTML = billCategories.map(b=>`
    <button class="grid-icon-item" onclick="openBill('${b.label}','${b.icon}')">
      <div class="ic"><span class="material-symbols-rounded">${b.icon}</span></div><span class="lbl">${b.label}</span>
    </button>`).join('');
}
function openBill(label, icon){
  document.getElementById('billPayTitle').textContent = label;
  document.getElementById('billPayIcon').textContent = icon;
  go('bill-pay');
}

const txnToday = [
  {name:'Chiamaka Eze', sub:'Wallet transfer · received', amt:'+₦45,000', dir:'in', icon:'south_west', chip:'success', chipLabel:'Successful'},
  {name:'Netflix Subscription', sub:'Card payment', amt:'-₦4,500', dir:'out', icon:'north_east', chip:'success', chipLabel:'Successful'},
  {name:'IKEDC Electricity', sub:'Bill payment', amt:'-₦5,000', dir:'out', icon:'bolt', chip:'pending', chipLabel:'Processing'},
];
const txnYesterday = [
  {name:'Tunde Johnson', sub:'Bank transfer · Access Bank', amt:'-₦12,000', dir:'out', icon:'north_east', chip:'success', chipLabel:'Successful'},
  {name:'Cashback Reward', sub:'Promo bonus', amt:'+₦120', dir:'in', icon:'redeem', chip:'success', chipLabel:'Successful'},
  {name:'DSTV Compact Plus', sub:'Cable TV subscription', amt:'-₦18,400', dir:'out', icon:'live_tv', chip:'failed', chipLabel:'Failed'},
];
function renderTxnList(elId, list){
  const el = document.getElementById(elId);
  if(!el) return;
  el.innerHTML = list.map((t,i)=>`
    <div class="list-item" data-goto="transaction-details">
      <div class="ic" style="background:${t.dir==='in'?'var(--green-soft)':'var(--surface-2)'};"><span class="material-symbols-rounded" style="font-size:20px; color:${t.dir==='in'?'var(--green)':'var(--text-1)'};">${t.icon}</span></div>
      <div class="meta"><div class="t1">${t.name}</div><div class="t2">${t.sub}</div></div>
      <div class="end"><div class="v1" style="color:${t.dir==='in'?'var(--green)':'var(--text-1)'};">${t.amt}</div><span class="chip ${t.chip}" style="margin-top:4px; padding:3px 8px; font-size:10px;">${t.chipLabel}</span></div>
    </div>${i<list.length-1?'<div class="divider" style="margin:4px 0;"></div>':''}`).join('');
}

function renderCheckin(){
  const el = document.getElementById('checkinRow');
  if(!el) return;
  const days = ['M','T','W','T','F','S','S'];
  el.innerHTML = days.map((d,i)=>{
    const done = i < 3;
    const isToday = i === 3;
    return `<div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex:1;">
      <div style="width:30px;height:30px;border-radius:50%; display:flex; align-items:center; justify-content:center; background:${done?'var(--grad)':'var(--surface-2)'}; border:${isToday?'2px solid var(--green)':'1px solid var(--surface-border)'};">
        ${done?'<span class="material-symbols-rounded" style="font-size:15px; color:#04140E;">check</span>':''}
      </div>
      <span class="tiny muted" style="font-size:10px;">${d}</span>
    </div>`;
  }).join('');
}

/* ====================== UI HELPER FUNCTIONS ====================== */
let balanceHidden = false;
function toggleBalance(){
  balanceHidden = !balanceHidden;
  document.getElementById('balanceText').textContent = balanceHidden ? '₦ • • • • • •' : '₦248,650.75';
  document.getElementById('eyeToggle').textContent = balanceHidden ? 'visibility_off' : 'visibility';
}
function setSendTab(tab){
  const bank = document.getElementById('tabBank'), wallet = document.getElementById('tabWallet');
  if(tab==='bank'){
    bank.style.background='var(--grad)'; bank.style.color='#04140E';
    wallet.style.background='transparent'; wallet.style.color='var(--text-2)';
  } else {
    wallet.style.background='var(--grad)'; wallet.style.color='#04140E';
    bank.style.background='transparent'; bank.style.color='var(--text-2)';
  }
}
let cardFrozen = false;
function toggleFreeze(){
  cardFrozen = !cardFrozen;
  document.getElementById('freezeSwitch').classList.toggle('on', cardFrozen);
  document.getElementById('frozenOverlay').style.display = cardFrozen ? 'flex' : 'none';
  toast(cardFrozen ? 'Card frozen' : 'Card unfrozen');
}

// OTP auto-advance
document.querySelectorAll('.otp-row input').forEach((inp,idx,list)=>{
  inp.addEventListener('input', ()=>{ if(inp.value && list[idx+1]) list[idx+1].focus(); });
  inp.addEventListener('keydown', (e)=>{ if(e.key==='Backspace' && !inp.value && list[idx-1]) list[idx-1].focus(); });
});

// close bottom sheet when tapping the dimmed overlay itself
document.querySelectorAll('.bottom-sheet-overlay').forEach(ov=>{
  ov.addEventListener('click', (e)=>{ if(e.target === ov) ov.classList.remove('show'); });
});

// password visibility toggles
document.querySelectorAll('.toggle-eye').forEach(eye=>{
  eye.addEventListener('click', ()=>{
    const input = eye.previousElementSibling;
    if(input && input.tagName==='INPUT'){
      input.type = input.type === 'password' ? 'text' : 'password';
      eye.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
    }
  });
});

// PIN keypad visual fill (cosmetic, for create-pin / send-pin screens)
document.querySelectorAll('.keypad button').forEach(btn=>{
  if(!btn.classList.contains('fn')){
    btn.addEventListener('click', ()=>{
      const dots = btn.closest('.screen').querySelectorAll('.pin-dots .d');
      const next = Array.from(dots).find(d=>!d.classList.contains('filled'));
      if(next) next.classList.add('filled');
    });
  }
});

// init renders
renderQuickActions();
renderChart();
renderRecentTxns();
renderRecipients();
renderBillsGrid();
renderTxnList('txnListToday', txnToday);
renderTxnList('txnListYesterday', txnYesterday);
renderCheckin();

/* SCRIPT_END */