/* PawCare application logic - demo only, no database required */
const STORAGE_KEY = 'pawcare_bookings_v1';
const CAT_PHOTOS_KEY = 'pawcare_cat_photos_v1';
const OWNER_CONTACTS_KEY = 'pawcare_owner_contacts_v1';
const THEME_KEY = 'pawcare_theme';

function getPreferredTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  if(saved==='dark'||saved==='light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
}

function applyTheme(theme, updateCharts=true){
  document.documentElement.setAttribute('data-theme',theme);
  localStorage.setItem(THEME_KEY,theme);
  if(window.Chart){
    Chart.defaults.color=theme==='dark'?'#adb3c7':'#73788c';
    Chart.defaults.borderColor=theme==='dark'?'#303443':'#e8e9f0';
    Chart.defaults.scale.grid.color=theme==='dark'?'#26364d':Chart.defaults.color;
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
    const dark=theme==='dark';
    button.innerHTML=`<i class="bi ${dark?'bi-sun':'bi-moon-stars'}"></i>`;
    button.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    button.setAttribute('title',dark?'Switch to light mode':'Switch to dark mode');
  });
  if(updateCharts&&window.Chart){
    ['bookingChart','genderChart','ageChart'].forEach(id=>{
      const chart=Chart.getChart(id);
      if(chart) chart.update();
    });
  }
}

function toggleTheme(){
  applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
}

function addThemeToggle(){
  let button=document.querySelector('[data-theme-toggle]');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='theme-toggle';
    button.setAttribute('data-theme-toggle','');
    const headerActions=document.querySelector('.header-actions');
    if(headerActions) headerActions.prepend(button);
    else{
      button.classList.add('login-theme-toggle');
      document.body.appendChild(button);
    }
  }
  if(!button.dataset.themeReady){
    button.addEventListener('click',toggleTheme);
    button.dataset.themeReady='true';
  }
  applyTheme(document.documentElement.getAttribute('data-theme')||getPreferredTheme(),false);
}

applyTheme(getPreferredTheme(),false);

const seedBookings = [
  {id:'BK001',owner:'Aina Rahman',ownerAge:24,cat:'Milo',gender:'Male',catAge:2,breed:'Persian',date:'2026-10-28',duration:'1 day',payment:'Paid',status:'Completed',notes:''},
  {id:'BK002',owner:'Daniel Lim',ownerAge:29,cat:'Oreo',gender:'Female',catAge:1,breed:'British Shorthair',date:'2026-11-06',duration:'2 days',payment:'Paid',status:'Pending',notes:'Medication at night'},
  {id:'BK003',owner:'Sofia Karim',ownerAge:31,cat:'Snowy',gender:'Female',catAge:3,breed:'Domestic Shorthair',date:'2026-11-06',duration:'1 day',payment:'Unpaid',status:'Pending',notes:''},
  {id:'BK004',owner:'Haziq Noor',ownerAge:26,cat:'Simba',gender:'Male',catAge:5,breed:'Maine Coon',date:'2026-10-14',duration:'3 days',payment:'Paid',status:'Completed',notes:''},
  {id:'BK005',owner:'Mei Tan',ownerAge:34,cat:'Luna',gender:'Female',catAge:7,breed:'Ragdoll',date:'2026-09-22',duration:'1 day',payment:'Paid',status:'Completed',notes:''},
  {id:'BK006',owner:'Farah Ismail',ownerAge:28,cat:'Coco',gender:'Male',catAge:9,breed:'Mixed',date:'2026-11-12',duration:'1 week',payment:'Unpaid',status:'Registered',notes:'Owner travelling'},
  {id:'BK007',owner:'Adam Wong',ownerAge:40,cat:'Tiger',gender:'Male',catAge:4,breed:'Domestic Shorthair',date:'2026-08-09',duration:'2 days',payment:'Paid',status:'Completed',notes:''}
];

function getBookings(){
  if(!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(seedBookings));
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}
function saveBookings(data){localStorage.setItem(STORAGE_KEY, JSON.stringify(data));}
function escapeHTML(value){
  const entities={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
  return String(value??'').replace(/[&<>"']/g,char=>entities[char]);
}
function getOwnerContacts(){
  return JSON.parse(localStorage.getItem(OWNER_CONTACTS_KEY)||'{}');
}
function getOwnerContact(owner,contacts=getOwnerContacts()){
  return Object.prototype.hasOwnProperty.call(contacts,owner)?contacts[owner]:{};
}
function saveOwnerContact(owner,address,phone){
  const contacts=Object.assign(Object.create(null),getOwnerContacts());
  contacts[owner]={address,phone};
  localStorage.setItem(OWNER_CONTACTS_KEY,JSON.stringify(contacts));
}
function getCatPhoto(cat){
  const photos=JSON.parse(localStorage.getItem(CAT_PHOTOS_KEY)||'{}');
  return photos[cat];
}
function saveCatPhoto(cat,photo,errorElement){
  const photos=JSON.parse(localStorage.getItem(CAT_PHOTOS_KEY)||'{}');
  photos[cat]=photo;
  try{
    localStorage.setItem(CAT_PHOTOS_KEY,JSON.stringify(photos));
    return true;
  }catch(error){
    if(error instanceof DOMException&&['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name)){
      errorElement.textContent='There is not enough browser storage for this photo. Try a smaller image or remove an old booking photo.';
      errorElement.classList.remove('d-none');
      return false;
    }
    throw error;
  }
}
function deleteCatPhoto(cat){
  const photos=JSON.parse(localStorage.getItem(CAT_PHOTOS_KEY)||'{}');
  delete photos[cat];
  if(Object.keys(photos).length) localStorage.setItem(CAT_PHOTOS_KEY,JSON.stringify(photos));
  else localStorage.removeItem(CAT_PHOTOS_KEY);
}
function readCatPhoto(file,onLoad,onError){
  const reader=new FileReader();
  reader.onload=()=>{
    const image=new Image();
    image.onload=()=>{
      const scale=Math.min(1,800/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const context=canvas.getContext('2d');
      if(!context){onError();return;}
      context.drawImage(image,0,0,canvas.width,canvas.height);
      onLoad(canvas.toDataURL('image/webp',.78));
    };
    image.onerror=onError;
    image.src=reader.result;
  };
  reader.onerror=onError;
  reader.readAsDataURL(file);
}
function protectPage(){ if(sessionStorage.getItem('pawcare_logged_in')!=='true'){window.location.href='index.html';} }
function logout(){sessionStorage.removeItem('pawcare_logged_in');window.location.href='index.html';}

document.addEventListener('DOMContentLoaded',()=>{
  addThemeToggle();
  const username=document.getElementById('username');
  const password=document.getElementById('password');
  const demoAutofill=document.getElementById('demoAutofill');
  const fillDemoCredentials=document.getElementById('fillDemoCredentials');
  if(demoAutofill&&fillDemoCredentials){
    [username,password].forEach(input=>input.addEventListener('focus',()=>demoAutofill.classList.remove('d-none')));
    fillDemoCredentials.addEventListener('click',()=>{
      username.value='admin';
      password.value='pawcare123';
      demoAutofill.classList.add('d-none');
      document.getElementById('loginError').classList.add('d-none');
      password.focus();
    });
  }
  const form=document.getElementById('loginForm');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault();
    const u=document.getElementById('username').value.trim();
    const p=document.getElementById('password').value;
    const error=document.getElementById('loginError');
    if(u==='admin' && p==='pawcare123'){
      sessionStorage.setItem('pawcare_logged_in','true');
      window.location.href='dashboard.html';
    }else{
      error.textContent='Invalid username or password. Please try again.';
      error.classList.remove('d-none');
    }
  });
});

function statusBadge(status){
  return `<span class="badge-status status-${status.toLowerCase()}">${status}</span>`;
}
function formatDate(date){
  return new Date(date+'T00:00:00').toLocaleDateString('en-MY',{day:'2-digit',month:'short',year:'numeric'});
}

function loadDashboard(){
  const data=getBookings();
  document.getElementById('kpiCompleted').textContent=data.filter(x=>x.status==='Completed').length;
  document.getElementById('kpiPending').textContent=data.filter(x=>x.status==='Pending').length;
  document.getElementById('kpiRegistered').textContent=new Set(data.map(x=>x.owner)).size;
  document.getElementById('kpiCats').textContent=new Set(data.map(x=>x.cat)).size;

  const recent=[...data].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  document.getElementById('recentBookings').innerHTML=recent.map(x=>`<tr><td><strong>${x.cat}</strong><div class="small text-muted">${x.owner}</div></td><td>${formatDate(x.date)}</td><td>${statusBadge(x.status)}</td></tr>`).join('');

  new Chart(document.getElementById('bookingChart'),{
    type:'bar',
    data:{labels:['Jun','Jul','Aug','Sep','Oct','Nov'],datasets:[
      {label:'Completed',data:[1,0,1,0,2,0],backgroundColor:'#247bff',borderRadius:6},
      {label:'Scheduled',data:[0,1,0,1,1,2],backgroundColor:'#f39a3c',borderRadius:6}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}
  });

  const male=data.filter(x=>x.gender==='Male').length, female=data.filter(x=>x.gender==='Female').length;
  new Chart(document.getElementById('genderChart'),{
    type:'doughnut',data:{labels:['Male','Female'],datasets:[{data:[male,female],backgroundColor:['#247bff','#f39a3c'],borderWidth:0}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom'}}}
  });

  const ageGroups={ '0–2 years':0,'3–5 years':0,'6–8 years':0,'9+ years':0 };
  data.forEach(x=>{if(x.catAge<=2)ageGroups['0–2 years']++;else if(x.catAge<=5)ageGroups['3–5 years']++;else if(x.catAge<=8)ageGroups['6–8 years']++;else ageGroups['9+ years']++;});
  new Chart(document.getElementById('ageChart'),{
    type:'bar',data:{labels:Object.keys(ageGroups),datasets:[{label:'Cats',data:Object.values(ageGroups),backgroundColor:'#247bff',borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,ticks:{stepSize:1}}}}
  });
}

function initBookings(){
  renderBookings();
  ['bookingSearch','statusFilter','paymentFilter'].forEach(id=>document.getElementById(id).addEventListener('input',renderBookings));
  document.getElementById('bookingForm').addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(e.target), data=getBookings();
    const item=Object.fromEntries(fd.entries());
    delete item.catPhotoFile;
    item.id='BK'+String(Date.now()).slice(-5);
    item.ownerAge=Number(item.ownerAge); item.catAge=Number(item.catAge);
    const photo=document.getElementById('newCatPhoto').files[0];
    const photoError=document.getElementById('bookingPhotoError');
    if(photo&&photo.size>2*1024*1024){
      photoError.textContent='Choose an image smaller than 2 MB.';
      photoError.classList.remove('d-none');
      return;
    }
    const saveItem=()=>{
      data.push(item);
      saveBookings(data);
      saveOwnerContact(item.owner,item.address,item.phone);
      e.target.reset();
      photoError.classList.add('d-none');
      bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
      renderBookings();
    };
    if(photo){
      if(!photo.type.startsWith('image/')){
        photoError.textContent='Choose a valid image file.';
        photoError.classList.remove('d-none');
        return;
      }
      readCatPhoto(photo,photoData=>{
        if(saveCatPhoto(item.cat,photoData,photoError)) saveItem();
      },()=>{
        photoError.textContent='The photo could not be read. Please try another file.';
        photoError.classList.remove('d-none');
      });
    }else saveItem();
  });
  document.getElementById('catPhotoFile').addEventListener('change',updateBookingCatPhoto);
}
function renderBookings(){
  const data=getBookings(), q=(document.getElementById('bookingSearch')?.value||'').toLowerCase();
  const status=document.getElementById('statusFilter')?.value||'', payment=document.getElementById('paymentFilter')?.value||'';
  const contacts=getOwnerContacts();
  const filtered=data.filter(x=>(!q||[x.id,x.owner,x.cat].join(' ').toLowerCase().includes(q))&&(!status||x.status===status)&&(!payment||x.payment===payment));
  document.getElementById('bookingTable').innerHTML=filtered.map(x=>`<tr>
  <td><strong>${x.id}</strong></td><td><button class="cat-name-button" onclick="showCatPhoto('${x.id}')" aria-label="View ${x.cat}'s photo"><strong>${x.cat}</strong><i class="bi bi-image ms-1" aria-hidden="true"></i></button><div class="small text-muted">${x.breed||'-'}</div></td><td>${x.owner}</td><td class="address-cell">${escapeHTML(x.address||getOwnerContact(x.owner,contacts).address||'Not provided')}</td><td>${formatDate(x.date)}</td><td>${x.duration}</td><td class="${x.payment==='Paid'?'payment-paid':'payment-unpaid'}">${x.payment}</td><td>${statusBadge(x.status)}</td>
  <td><button class="btn btn-sm btn-light" title="Delete" onclick="deleteBooking('${x.id}')"><i class="bi bi-trash3"></i></button></td></tr>`).join('') || '<tr><td colspan="9" class="text-center text-muted py-4">No bookings found.</td></tr>';
}
function showCatPhoto(id){
  const data=getBookings();
  const booking=data.find(item=>item.id===id);
  if(!booking) return;
  const photo=getCatPhoto(booking.cat)||booking.catPhoto||data.find(item=>item.cat===booking.cat&&item.catPhoto)?.catPhoto;
  const image=document.getElementById('catPhotoPreview');
  const empty=document.getElementById('catPhotoEmpty');
  document.getElementById('catPhotoTitle').textContent=booking.cat+'’s photo';
  document.getElementById('catPhotoBookingId').value=id;
  document.getElementById('catPhotoError').classList.add('d-none');
  document.getElementById('catPhotoFile').value='';
  image.src=photo||'';
  image.classList.toggle('d-none',!photo);
  empty.classList.toggle('d-none',!!photo);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('catPhotoModal')).show();
}
function updateBookingCatPhoto(event){
  const photo=event.target.files[0];
  if(!photo) return;
  const error=document.getElementById('catPhotoError');
  if(!photo.type.startsWith('image/')||photo.size>2*1024*1024){
    error.textContent=photo.size>2*1024*1024?'Choose an image smaller than 2 MB.':'Choose a valid image file.';
    error.classList.remove('d-none');
    return;
  }
  readCatPhoto(photo,photoData=>{
    const id=document.getElementById('catPhotoBookingId').value;
    const data=getBookings();
    const booking=data.find(item=>item.id===id);
    if(!booking) return;
    if(!saveCatPhoto(booking.cat,photoData,error)) return;
    renderBookings();
    document.getElementById('catPhotoPreview').src=photoData;
    document.getElementById('catPhotoPreview').classList.remove('d-none');
    document.getElementById('catPhotoEmpty').classList.add('d-none');
  },()=>{
    error.textContent='The photo could not be read. Please try another file.';
    error.classList.remove('d-none');
  });
}
function deleteBooking(id){
  if(confirm('Delete this booking record?')){
    const data=getBookings(), booking=data.find(x=>x.id===id), remaining=data.filter(x=>x.id!==id);
    saveBookings(remaining);
    if(booking&&!remaining.some(x=>x.cat===booking.cat)) deleteCatPhoto(booking.cat);
    renderBookings();
  }
}

function initCats(){
  renderCats();
  ['catSearch','genderFilter'].forEach(id=>document.getElementById(id).addEventListener('input',renderCats));
}
function renderCats(){
  const data=getBookings(), q=(document.getElementById('catSearch')?.value||'').toLowerCase(), gender=document.getElementById('genderFilter')?.value||'';
  const cats={};
  data.forEach(x=>{cats[x.cat] ??= {...x,sessions:0}; cats[x.cat].sessions++;});
  const rows=Object.values(cats).filter(x=>(!q||[x.cat,x.breed].join(' ').toLowerCase().includes(q))&&(!gender||x.gender===gender));
  document.getElementById('catTable').innerHTML=rows.map(x=>`<tr><td><strong>${x.cat}</strong></td><td>${x.breed||'-'}</td><td>${x.catAge} years</td><td>${x.gender}</td><td>${x.owner}</td><td>${x.sessions}</td></tr>`).join('')||'<tr><td colspan="6" class="text-center text-muted py-4">No cat records found.</td></tr>';
}

function initOwners(){
  renderOwners();
  document.getElementById('ownerSearch').addEventListener('input',renderOwners);
  document.getElementById('ownerTable').addEventListener('click',event=>{
    const button=event.target.closest('[data-edit-owner]');
    if(button) editOwnerContact(button.dataset.editOwner);
  });
  document.getElementById('ownerContactForm').addEventListener('submit',event=>{
    event.preventDefault();
    const owner=document.getElementById('ownerContactName').value;
    const address=document.getElementById('ownerContactAddress').value.trim();
    const phone=document.getElementById('ownerContactPhone').value.trim();
    saveOwnerContact(owner,address,phone);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('ownerContactModal')).hide();
    renderOwners();
  });
}
function editOwnerContact(owner){
  const contacts=getOwnerContacts(), bookings=getBookings().filter(item=>item.owner===owner);
  const contact=getOwnerContact(owner,contacts);
  const latestAddress=[...bookings].reverse().find(item=>item.address)?.address||'';
  const latestPhone=[...bookings].reverse().find(item=>item.phone)?.phone||'';
  document.getElementById('ownerContactName').value=owner;
  document.getElementById('ownerContactDisplay').value=owner;
  document.getElementById('ownerContactAddress').value=contact.address||latestAddress;
  document.getElementById('ownerContactPhone').value=contact.phone||latestPhone;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('ownerContactModal')).show();
}
function renderOwners(){
  const data=getBookings(), contacts=getOwnerContacts(), q=(document.getElementById('ownerSearch')?.value||'').toLowerCase(), owners=Object.create(null);
  data.forEach(x=>{owners[x.owner] ??= {name:x.owner,age:x.ownerAge,cats:new Set(),sessions:0,paid:true};owners[x.owner].cats.add(x.cat);owners[x.owner].sessions++;if(x.payment==='Unpaid')owners[x.owner].paid=false;});
  data.forEach(x=>{
    if(x.address) owners[x.owner].address=x.address;
    if(x.phone) owners[x.owner].phone=x.phone;
  });
  const rows=Object.values(owners).map(owner=>({...owner,...getOwnerContact(owner.name,contacts)})).filter(x=>x.name.toLowerCase().includes(q));
  document.getElementById('ownerTable').innerHTML=rows.map(x=>`<tr><td><strong>${escapeHTML(x.name)}</strong></td><td>${x.age}</td><td>${x.cats.size}</td><td>${x.sessions}</td><td class="${x.paid?'payment-paid':'payment-unpaid'}">${x.paid?'Paid':'Outstanding'}</td><td class="address-cell">${escapeHTML(x.address||'Not provided')}</td><td>${escapeHTML(x.phone||'Not provided')}</td><td><button type="button" class="btn btn-sm btn-light" data-edit-owner="${escapeHTML(x.name)}"><i class="bi bi-pencil me-1" aria-hidden="true"></i>Edit contact</button></td></tr>`).join('')||'<tr><td colspan="8" class="text-center text-muted py-4">No owner records found.</td></tr>';
}
