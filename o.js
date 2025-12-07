// ------------- Audio Alarm -------------
function playAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.value = 900;

  let up = true;
  const sweep = setInterval(() => {
    osc.frequency.value = up ? 1200 : 700;
    up = !up;
  }, 240);

  gain.gain.value = 0.3;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();

  setTimeout(()=>{
    clearInterval(sweep);
    osc.stop();
    ctx.close();
  }, 3000);
}

// ------------- Utilities -------------
const nowStr = () => new Date().toLocaleString('ar-EG',{hour12:false});

const logTimeline = (text, level='info') => {
  const t = document.getElementById('timeline');
  if(!t) return;

  const row = document.createElement('div');
  row.className='log-row';

  const color = (level === 'danger' ? '#ffb6b6' :
                level === 'warn' ? '#ffd7a8' : '#93a3ad');

  const strong = document.createElement('strong');
  strong.style.color = color;
  strong.textContent = '[' + nowStr() + ']';

  row.appendChild(strong);
  row.appendChild(document.createTextNode(' — ' + text));
  t.prepend(row);
};

// ------------- Camera Simulation Class -------------
class SimCam {
  constructor(id,canvasId){
    this.id = id;
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.w = this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
    this.h = this.canvas.height = this.canvas.clientHeight * devicePixelRatio;

    this.objects = [];
    this.smoke = 0;
    this.heat = 0;
    this.crowd = 0;
    this.movement = 0; // حساس الحركة

    this.initObjects();
    this.start();

    this.canvas.addEventListener('click', ()=> this.toggleEnlarge());
  }

  toggleEnlarge(){
    const box = this.canvas.parentElement;
    box.classList.toggle('enlarged');
  }

  initObjects(){
    for(let i=0;i<8;i++){
      this.objects.push({
        x: Math.random()*this.w,
        y: Math.random()*this.h,
        vx: (Math.random()*2 - 1) * devicePixelRatio,
        vy: (Math.random()*2 - 1) * devicePixelRatio,
        r: 8 + Math.random()*12
      });
    }
  }

  step(){
    this.ctx.clearRect(0,0,this.w,this.h);
    this.ctx.fillStyle = '#07121a';
    this.ctx.fillRect(0,0,this.w,this.h);

    for(const o of this.objects){
      o.x += o.vx; o.y += o.vy;

      if(o.x < 0 || o.x > this.w) o.vx *= -1;
      if(o.y < 0 || o.y > this.h) o.vy *= -1;

      this.ctx.beginPath();
      this.ctx.fillStyle = '#bdeef8';
      this.ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
      this.ctx.fill();
    }
  }

  start(){
    setInterval(()=> this.step(), 60);
  }

  setSmoke(v){ this.smoke = v; }
  setHeat(v){ this.heat = v; }
  setCrowd(v){ this.crowd = v; }
  setMovement(v){ this.movement = v; } // حساس الحركة
}

// ------------- Initialize Cameras -------------
const cams = [
  new SimCam(1, 'cam1'),
  new SimCam(2, 'cam2')
];

// ------------- Automatic Random Behavior -------------
cams.forEach(c=>{
  c.smoke = 0.1;
  c.heat = 0.2;
  c.crowd = 0.1;
  c.movement = 0.1;
});

setInterval(()=>{
  cams.forEach(c=>{
    c.setSmoke(Math.min(1, Math.max(0, c.smoke + (Math.random()*0.05 - 0.025))));
    c.setHeat(Math.min(1, Math.max(0, c.heat + (Math.random()*0.05 - 0.025))));
    c.setCrowd(Math.min(1, Math.max(0, c.crowd + (Math.random()*0.05 - 0.025))));
    c.setMovement(Math.min(1, Math.max(0, c.movement + (Math.random()*0.05 - 0.025))));
  });
}, 1000);

// ------------- Monitoring & Alerts -------------
function analyze(){
  for(const c of cams){
    if(c.smoke > 0.5) generateAlert(c, "دخان/حريق", "danger");
    else if(c.heat > 0.6) generateAlert(c, "ارتفاع حرارة", "warn");
    else if(c.crowd > 0.7) generateAlert(c, "ازدحام", "warn");
    else if(c.movement > 0.65) generateAlert(c, "حركة غير طبيعية", "warn");
    else updateStatus(c.id, "آمنة", "safe");
  }
}
setInterval(analyze, 800);

function updateStatus(id, text, level){
  const el = document.getElementById("status" + id);
  el.textContent = text;el.className = "status " + level;
}

function generateAlert(c, msg, level){
  const a = document.getElementById("alerts");

  const box = document.createElement('div');
  box.className = "alert-item " + (level === "danger" ? "danger" : "");

  box.innerHTML =
  `
    <strong>كاميرا ${c.id}</strong><br>
    <span style="font-size:13px;color:#93a3ad">${msg}</span><br>
    <span style="font-size:12px;color:#93a3ad">${nowStr()}</span>
  `;

  a.prepend(box);
  logTimeline("كاميرا " + c.id + ": " + msg, level);

  if(level === "danger") playAlarm();
  updateStatus(c.id, msg, level);
}

// ------------- Controls -------------
document.getElementById('simulateFire').addEventListener('click', ()=>{
  const c = cams[Math.floor(Math.random()*cams.length)];
  c.setSmoke(0.9);
  generateAlert(c, "حريق كبير — ضرورة إخلاء فوري", "danger");
});

document.getElementById('simulateHeat').addEventListener('click', ()=>{
  const c = cams[Math.floor(Math.random()*cams.length)];
  c.setHeat(0.85);
  generateAlert(c, "ارتفاع حرارة شديد", "warn");
});

document.getElementById('simulateCrowd').addEventListener('click', ()=>{
  const c = cams[Math.floor(Math.random()*cams.length)];
  c.setCrowd(0.9);
  generateAlert(c, "ازدحام شديد", "warn");
});

document.getElementById('simulateMotion').addEventListener('click', ()=>{
  const c = cams[Math.floor(Math.random()*cams.length)];
  c.setMovement(0.9);
  generateAlert(c, "حركة عالية — احتمال وجود شخص", "warn");
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  cams.forEach(c=>{
    c.setSmoke(0.1);
    c.setHeat(0.2);
    c.setCrowd(0.1);
    c.setMovement(0.1);
    updateStatus(c.id, "آمنة", "safe");
  });

  document.getElementById("alerts").innerHTML = '';
  logTimeline("تمت إعادة تعيين النظام", "info");
});