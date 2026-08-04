;var V=function(){var d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')}()

var log=function(){console.log('%cDyT_EG', 'background:#C9A84C;color:#0C0C0C;padding:2px 6px;border-radius:3px;font-weight:bold', [].slice.call(arguments).join(' '))}

var auralisBase=[{jquery:1,googlefonts:1,phosphor:1,turnstile:1,DyT_EG:1}]

function extract(tag, attr){
  var m=tag.match(new RegExp(attr+'="([^"]+)"'))
  return m?m[1]:''
}

function loadScript(src, where){
  return new Promise(function(res, rej){
    var s=document.createElement('script')
    s.src=src
    s.onload=res
    s.onerror=function(){log('Error loading '+src);res()}
    ;(where||document.body).appendChild(s)
  })
}

function loadStyle(href){
  return new Promise(function(res, rej){
    var l=document.createElement('link')
    l.rel='stylesheet'
    l.href=href
    l.onload=res
    l.onerror=function(){log('Error loading style '+href);res()}
    document.head.appendChild(l)
  })
}

function loadScriptsSequential(list){
  return list.reduce(function(p, src){
    return p.then(function(){return loadScript(src)})
  }, Promise.resolve())
}

function injectTag(tag, where){
  var d=document.createElement('div')
  d.innerHTML=tag.trim()
  while(d.firstChild)where.appendChild(d.firstChild)
}

var resourcesAllowed=[
  {
    name:'googlefonts',realName:'Google Fonts',page:'https://fonts.google.com',
    versions:{0:{key:['1','1.0'],head:{link:['<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">']}}}
  },
  {
    name:'jquery',realName:'jQuery',page:'https://jquery.com',github:'https://github.com/jquery/jquery',
    versions:{0:{key:['1','1.0'],body:{src:['<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>']}}}
  },
  {
    name:'phosphor',realName:'Phosphor Icons',page:'https://phosphoricons.com',github:'https://github.com/phosphor-icons/web',
    versions:{0:{key:['1','1.0'],head:{link:['<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css">', '<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css">']}}}
  },
  {
    name:'turnstile',realName:'Cloudflare Turnstile',page:'https://www.cloudflare.com/products/turnstile/',
    versions:{0:{key:['1','1.0'],head:{link:['<link rel="preconnect" href="https://challenges.cloudflare.com">'],src:['<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>']}}}
  },
  {
    name:'DyT_EG',realName:'DyT_EG',page:'local',github:'local',
    versions:
    {
      0:{
        key:['1','1.0'],
        head:{
          link:['<link rel="stylesheet" href="public/css/style.css">', '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.css">']
        },
        body:{
          src:[
            '<script src="controllers/routes.js"></script>',
            '<script src="controllers/academyController.js"></script>',
            '<script src="controllers/paymentController.js"></script>',
            '<script src="controllers/academyContentController.js"></script>',
            '<script src="controllers/uploadController.js"></script>',
            '<script src="controllers/authController.js"></script>',
            '<script src="controllers/contactController.js"></script>',
            '<script src="controllers/ticketController.js"></script>',
            '<script src="controllers/projectController.js"></script>',
            '<script src="controllers/testimonialController.js"></script>',
            '<script src="public/js/games.js"></script>',
            '<script src="public/js/experience.js"></script>',
            '<script src="public/js/auth.js"></script>',
            '<script src="public/js/academia.js"></script>',
            '<script src="public/js/turnstile.js"></script>',
            '<script src="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"></script>',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.5/purify.min.js"></script>',
            '<script src="https://cdn.jsdelivr.net/npm/plyr@3.7.8/dist/plyr.min.js"></script>',
            '<script src="https://cdn.conekta.io/js/latest/conekta.js"></script>'
          ]
        }
      }
    }
  }
]

function getLocalStorage(key) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function buildUrl(template, params) {
  params = params || {};
  return template.replace(/\[(\w+)\]/g, function (_, key) {
    return params[key] !== undefined ? params[key] : '';
  });
}

function showError(message) {
  console.error(message);
  var container = document.getElementById('toastContainer');
  var toast = document.getElementById('toastMessage');
  if (container && toast) {
    toast.textContent = message;
    toast.classList.remove('toast-message--success');
    container.classList.add('visible');
    setTimeout(function () { container.classList.remove('visible'); }, 3000);
  } else {
    alert(message);
  }
}

function showSuccess(message) {
  var container = document.getElementById('toastContainer');
  var toast = document.getElementById('toastMessage');
  if (container && toast) {
    toast.textContent = message;
    toast.classList.add('toast-message--success');
    container.classList.add('visible');
    setTimeout(function () { container.classList.remove('visible'); }, 3000);
  } else {
    alert(message);
  }
}

function getResourceInfo(name, ver){
  var res=resourcesAllowed.find(function(r){return r.name===name})
  if(!res)return null
  var keys=Object.keys(res.versions)
  for(var i=0;i<keys.length;i++){
    var v=res.versions[keys[i]]
    if(v.key.indexOf(String(ver))>=0){
      return{
        name:res.name,realName:res.realName,version:v.key[1]||v.key[0],
        links:v.head&&v.head.link?v.head.link:[],
        headSRC:v.head&&v.head.src?v.head.src:[],
        bodySRC:v.body&&v.body.src?v.body.src:[]
      }
    }
  }
  return null
}

function getBodyResources(){
  var attrs=document.body.attributes
  var resources=[]
  var names={}

  // Siempre cargar recursos propios del sitio
  auralisBase.forEach(function(item){
    Object.keys(item).forEach(function(name){
      resources.push({name:name,value:item[name]})
      names[name]=1
    })
  })

  // Agregar recursos externos del body (jQuery, Bootstrap, Phosphor, etc.)
  for(var i=0;i<attrs.length;i++){
    var name=attrs[i].name
    var val=attrs[i].value
    if(name==='data-page'||name==='sections'||name.indexOf('data-')===0)continue
    if(names[name])continue
    if(resourcesAllowed.find(function(r){return r.name===name})){
      resources.push({name:name,value:val})
      names[name]=1
    }
  }
  return resources
}

function ensureCharset(){
  var meta=document.querySelector('meta[charset]')
  if(!meta){meta=document.createElement('meta');meta.setAttribute('charset','utf-8')}
  if(document.head.firstChild!==meta)document.head.insertBefore(meta,document.head.firstChild)
}

function loadView(view, containerId){
  var el=document.getElementById(containerId)
  if(!el)return Promise.resolve()
  return fetch('views/'+view+'.html?v='+V).then(function(r){
    if(!r.ok)throw new Error('View '+view+' not found')
    return r.text()
  }).then(function(html){
    var scripts=''
    html=html.replace(/<script>([\s\S]*?)<\/script>/g,function(m,c){scripts+=c;return ''})
    el.innerHTML=html
    if(scripts){
      var s=document.createElement('script')
      s.textContent=scripts
      el.appendChild(s)
    }
    document.dispatchEvent(new CustomEvent('auralis:section-loaded',{detail:{view:view,containerId:containerId}}))
  }).catch(function(err){
    log('Error loading view '+view+': '+err.message)
  })
}

function hideLoading(id){
  var screen=document.getElementById(id||'loadingScreen')
  if(!screen)return
  screen.style.transition='opacity 0.5s'
  screen.style.opacity='0'
  setTimeout(function(){screen.remove()},500)
}

async function loadSections(){
  var sectionsAttr=document.body.getAttribute('sections')
  if(!sectionsAttr)return
  var sectionNames=sectionsAttr.split(',').map(function(s){return s.trim()}).filter(function(s){return s})
  var promises=sectionNames.map(function(name){
    return loadView('sections/'+name,'section-'+name)
  })
  await Promise.all(promises)
}

async function init(){
  var head=document.head,body=document.body
  if(!body){log('Error: body not found');return}
  var page=body.getAttribute('data-page')||'page'

  ensureCharset()
  log('Initializing v'+V+' · page: '+page)

  var bodyResources=getBodyResources()
  if(bodyResources.length===0){log('No resources requested');return}

  var headTasks=[],bodyScriptsArr=[]
  var linksAdded=[],headSRCAdded=[],bodySRCAdded=[]

  bodyResources.forEach(function(item){
    var name=item.name
    var info=getResourceInfo(name, item.value)
    if(!info)return

    info.links.forEach(function(tag){
      var h=extract(tag,'href')
      if(h&&linksAdded.indexOf(h)<0){
        linksAdded.push(h)
        headTasks.push(loadStyle(h))
      }
    })

    info.headSRC.forEach(function(tag){
      var s=extract(tag,'src')
      if(s&&headSRCAdded.indexOf(s)<0){
        headSRCAdded.push(s)
        headTasks.push(loadScript(s, head))
      }
    })

    info.bodySRC.forEach(function(tag){
      var s=extract(tag,'src')
      if(s&&bodySRCAdded.indexOf(s)<0){
        bodySRCAdded.push(s)
        bodyScriptsArr.push(s)
      }
    })
  })

  await Promise.all(headTasks)
  await loadScriptsSequential(bodyScriptsArr)

  await loadView('navbar','navbar-container')
  if(document.getElementById('footer-container'))await loadView('footer','footer-container')

  await loadSections()

  document.dispatchEvent(new Event('auralis:ready'))
  hideLoading()
  log('Ready')
}

document.addEventListener('DOMContentLoaded', init)

/* ============================================
   Site Functions — Navbar, Scroll, Nav Tracking
   ============================================ */

function initNavbarScroll(){
  var navbar=document.querySelector('.navbar-luxury')
  if(!navbar)return
  window.addEventListener('scroll',function(){
    if(window.scrollY>80){navbar.classList.add('navbar-scrolled')}
    else{navbar.classList.remove('navbar-scrolled')}
  },{passive:true})
}

function initSmoothScroll(){
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href^="#"]')
    if(!link)return
    var targetId=link.getAttribute('href')
    if(targetId==='#')return
    var target=document.querySelector(targetId)
    if(!target)return
    e.preventDefault()
    target.scrollIntoView({behavior:'smooth',block:'start'})
  })
}

function initActiveNavTracking(){
  var sections=document.querySelectorAll('.section')
  var navLinks=document.querySelectorAll('.navbar-link')
  if(!sections.length||!navLinks.length)return
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.id.replace('section-','')
        navLinks.forEach(function(link){
          link.classList.toggle('active',link.getAttribute('href')==='#'+id)
        })
      }
    })
  },{threshold:0.3,rootMargin:'-80px 0px -40% 0px'})
  sections.forEach(function(section){
    if(section.id)observer.observe(section)
  })
}

document.addEventListener('auralis:ready', function(){
  initNavbarScroll()
  initSmoothScroll()
  initActiveNavTracking()
  initScrollReveal()
  initRouter()
  if (typeof fetchAcademiaResources === 'function') fetchAcademiaResources()
})

document.addEventListener('auralis:section-loaded', function(){
  if (window.DyTTurnstile) DyTTurnstile.renderAll()
})

/* ============================================
   Router — Hash-based page navigation
   ============================================ */

var landingSections=['hero','services','portfolio','about','testimonials','pricing','academia','contact']
var currentPage=null

function initRouter(){
  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

var pageTitles={
  '':'Principal',
  'login':'Iniciar sesión',
  'register':'Crear cuenta',
  'verify':'Verificación de cuenta',
  'dashboard':'Dashboard',
  'account':'Mi Cuenta',
  'tickets':'Mis Tickets',
  'ticket-new':'Nuevo Ticket',
  'ticket-detail':'Detalle de Ticket',
  'admin':'Panel Admin',
  'admin-tickets':'Administrar Tickets',
  'admin-academy':'Administrar Academia',
  'admin-purchases':'Compras de Clientes',
  'admin-contacts':'Mensajes de Contacto',
  'admin-users':'Verificar Cuentas'
}
var siteName='Desarrollo y Tecnología - Enrique Galván'

function setTitle(key){
  var name=pageTitles[key]||key
  document.title=name+' | '+siteName
}

function handleRoute(){
  var hash=window.location.hash||'#/'
  var parts=hash.replace('#/','').split('/')
  var route=parts[0]||''

  switch(route){
    case '':showLanding();setTitle('');break
    case 'login':showPage('login',false);setTitle('login');break
    case 'register':showPage('register',false);setTitle('register');break
    case 'verify':showPage('verify',false);setTitle('verify');break
    case 'dashboard':showPage('dashboard',true);setTitle('dashboard');break
    case 'account':showPage('account',true);setTitle('account');break
    case 'tickets':
      if(parts[1]==='new'){showPage('ticket-new',true);setTitle('ticket-new')}
      else if(parts[1]){showPage('ticket-detail',true);setTitle('ticket-detail')}
      else{showPage('tickets',true);setTitle('tickets')}
      break
    case 'admin':
      if(parts[1]==='tickets'){showPage('admin-tickets',true,true);setTitle('admin-tickets')}
      else if(parts[1]==='academy'){showPage('admin-academy',true,true);setTitle('admin-academy')}
      else if(parts[1]==='projects'){showPage('admin-projects',true,true);setTitle('admin-projects')}
      else if(parts[1]==='purchases'){showPage('admin-purchases',true,true);setTitle('admin-purchases')}
      else if(parts[1]==='contacts'){showPage('admin-contacts',true,true);setTitle('admin-contacts')}
      else if(parts[1]==='users'){showPage('admin-users',true,true);setTitle('admin-users')}
      else{showPage('admin',true,true);setTitle('admin')}
      break
    case 'academia':
      if(parts[1]){
        window.location.href = 'resource.html?id=' + encodeURIComponent(parts[1])
        return
      }
      else{
        if(currentPage!==null){showLanding()}
        setTitle('');scrollToSection('academia')
      }
      break
    case 'projects':
      if(parts[1]){showPage('project-detail',false);setTitle('proyecto')}
      else{showPage('projects',false);setTitle('proyectos')}
      break
    case 'inicio':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('hero');break
    case 'servicios':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('services');break
    case 'nosotros':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('about');break
    case 'precios':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('pricing');break
    case 'portafolio':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('portfolio');break
    case 'testimonios':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('testimonials');break
    case 'contacto':
      if(currentPage!==null){showLanding()}
      setTitle('');scrollToSection('contact');break
    default:showLanding();setTitle('');break
  }
}

function showLanding(){
  currentPage=null
  document.body.classList.remove('page-active')
  var main=document.querySelector('main')
  if(!main)return
  main.innerHTML=''
  landingSections.forEach(function(name){
    var div=document.createElement('div')
    div.id='section-'+name
    div.className='section'
    main.appendChild(div)
  })
  loadSections().then(function(){initScrollReveal()})
}

function showPage(view,needsAuth,needsAdmin){
  if(needsAuth){
    var user=getLocalStorage('DyT_EG_user')
    if(!user||!user.token){window.location.hash='#/login';return}
    if(needsAdmin&&user.role!=='admin'){window.location.hash='#/dashboard';return}
  }
  currentPage=view
  document.body.classList.add('page-active')
  var main=document.querySelector('main')
  if(!main)return
  main.innerHTML='<div class="page-container" id="page-container"></div>'
  loadView('pages/'+view,'page-container').then(function(){initScrollReveal()})
  window.scrollTo({top:0,behavior:'smooth'})
}

function navigateTo(route){
  window.location.hash='#/'+route
}

function scrollToSection(id){
  setTimeout(function(){
    var el=document.getElementById('section-'+id)
    if(el)el.scrollIntoView({behavior:'smooth',block:'start'})
  },300)
}

function initScrollReveal(){
  var reveals=document.querySelectorAll('.reveal')
  if(!reveals.length)return
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  },{threshold:0.1,rootMargin:'0px 0px -50px 0px'})
  reveals.forEach(function(el){observer.observe(el)})
}

window.web={version:V,resourcesAllowed:resourcesAllowed,getResourceInfo:getResourceInfo}
window.loadView=loadView
window.log=log
window.navigateTo=navigateTo
window.handleRoute=handleRoute
