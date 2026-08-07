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
            '<script src="controllers/resourceController.js"></script>',
            '<script src="controllers/academyContentController.js"></script>',
            '<script src="controllers/uploadController.js"></script>',
            '<script src="controllers/authController.js"></script>',
            '<script src="controllers/contactController.js"></script>',
            '<script src="controllers/ticketController.js"></script>',
            '<script src="controllers/projectController.js"></script>',
            '<script src="controllers/projectDetailController.js"></script>',
            '<script src="controllers/testimonialController.js"></script>',
            '<script src="controllers/chatController.js"></script>',
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

function scrollIntoViewOffset(el){
  var navbar=document.querySelector('.navbar-luxury')
  var offset=navbar?navbar.offsetHeight:0
  var top=el.getBoundingClientRect().top+window.pageYOffset-offset
  window.scrollTo({top:top,behavior:'smooth'})
}

function initSmoothScroll(){
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href^="#"]')
    if(!link)return
    var targetId=link.getAttribute('href')
    if(targetId==='#'||targetId.indexOf('#/')===0)return
    var target=null
    try{target=document.querySelector(targetId)}catch(err){return}
    if(!target)return
    e.preventDefault()
    scrollIntoViewOffset(target)
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

var landingSections=['hero','services','about','proceso','portfolio','testimonials','pricing','academia','faq','contact']
var currentPage=null

function initRouter(){
  window.addEventListener('hashchange', handleRoute)
  handleRoute()
}

var pageMeta={
  '':{
    title:'Principal',
    desc:'DyT_EG - Estudio de desarrollo web en Reynosa, Tamaulipas. Experiencias digitales de alto impacto: landing pages, web apps, e-commerce y dashboards. Servimos a México y LATAM. 50+ proyectos, 98% satisfacción.',
    index:true
  },
  'login':{title:'Iniciar sesión',desc:'Inicia sesión en tu cuenta DyT_EG para consultar tus proyectos, recursos de la academia y tickets de soporte.',index:false},
  'register':{title:'Crear cuenta',desc:'Crea tu cuenta en DyT_EG y comienza a desarrollar tus proyectos web con nuestro equipo en Reynosa, Tamaulipas.',index:false},
  'verify':{title:'Verificación de cuenta',desc:'Verifica tu cuenta DyT_EG para activar tu acceso al portal de clientes.',index:false},
  'dashboard':{title:'Dashboard',desc:'Panel de control de DyT_EG con el estado de tus proyectos, recursos y tickets.',index:false},
  'account':{title:'Mi Cuenta',desc:'Administra los datos de tu cuenta DyT_EG.',index:false},
  'tickets':{title:'Mis Tickets',desc:'Consulta y da seguimiento a tus tickets de soporte con el equipo DyT_EG.',index:false},
  'ticket-new':{title:'Nuevo Ticket',desc:'Abre un nuevo ticket de soporte con DyT_EG.',index:false},
  'ticket-detail':{title:'Detalle de Ticket',desc:'Seguimiento detallado de tu ticket de soporte DyT_EG.',index:false},
  'projects':{title:'Proyectos',desc:'Portfolio de proyectos de desarrollo web de DyT_EG en Reynosa, Tamaulipas.',index:true},
  'proyectos':{title:'Proyectos',desc:'Portfolio de proyectos de desarrollo web de DyT_EG en Reynosa, Tamaulipas.',index:true},
  'admin':{title:'Panel Admin',desc:'Panel de administración de DyT_EG.',index:false},
  'admin-tickets':{title:'Administrar Tickets',desc:'Administración de tickets de soporte de DyT_EG.',index:false},
  'admin-academy':{title:'Administrar Academia',desc:'Administración de recursos de la academia DyT_EG.',index:false},
  'admin-projects':{title:'Administrar Proyectos',desc:'Administración de proyectos de DyT_EG.',index:false},
  'admin-purchases':{title:'Compras de Clientes',desc:'Registro de compras de los clientes de la academia DyT_EG.',index:false},
  'admin-contacts':{title:'Mensajes de Contacto',desc:'Mensajes recibidos a través del formulario de contacto de DyT_EG.',index:false},
  'admin-users':{title:'Verificar Cuentas',desc:'Verificación de cuentas de usuarios DyT_EG.',index:false}
}
var siteName='Desarrollo y Tecnología - Enrique Galván'

function setPageMeta(key){
  var meta=pageMeta[key]
  var title=(meta&&meta.title)||key
  var desc=(meta&&meta.desc)||''
  document.title=title+' | '+siteName
  setMetaContent('meta[name="description"]',desc)
  setMetaContent('meta[property="og:description"]',desc)
  setMetaContent('meta[name="twitter:description"]',desc)
  if(key!==''){
    setMetaContent('meta[property="og:title"]',title+' | '+siteName)
    setMetaContent('meta[name="twitter:title"]',title+' | '+siteName)
  }
  setRouteRobots(meta?meta.index!==false:false)
}

function setMetaContent(sel,value){
  var el=document.querySelector(sel)
  if(el)el.setAttribute('content',value)
}

function setLinkCanonical(url){
  var link=document.querySelector('link[rel="canonical"]')
  if(!link){
    link=document.createElement('link')
    link.setAttribute('rel','canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href',url)
}

function setRouteRobots(index){
  var robots=document.querySelector('meta[name="robots"]')
  if(!robots){
    robots=document.createElement('meta')
    robots.setAttribute('name','robots')
    document.head.appendChild(robots)
  }
  robots.setAttribute('content',index?'index,follow':'noindex,nofollow')
}

function handleRoute(){
  var hash=window.location.hash||'#/'
  var parts=hash.replace('#/','').split('/')
  var route=parts[0]||''

  switch(route){
    case '':showLanding();setPageMeta('');break
    case 'login':showPage('login',false);setPageMeta('login');break
    case 'register':showPage('register',false);setPageMeta('register');break
    case 'verify':showPage('verify',false);setPageMeta('verify');break
    case 'dashboard':showPage('dashboard',true);setPageMeta('dashboard');break
    case 'account':showPage('account',true);setPageMeta('account');break
    case 'tickets':
      if(parts[1]==='new'){showPage('ticket-new',true);setPageMeta('ticket-new')}
      else if(parts[1]){showPage('ticket-detail',true);setPageMeta('ticket-detail')}
      else{showPage('tickets',true);setPageMeta('tickets')}
      break
    case 'admin':
      if(parts[1]==='tickets'){showPage('admin-tickets',true,true);setPageMeta('admin-tickets')}
      else if(parts[1]==='academy'){showPage('admin-academy',true,true);setPageMeta('admin-academy')}
      else if(parts[1]==='projects'){showPage('admin-projects',true,true);setPageMeta('admin-projects')}
      else if(parts[1]==='purchases'){showPage('admin-purchases',true,true);setPageMeta('admin-purchases')}
      else if(parts[1]==='contacts'){showPage('admin-contacts',true,true);setPageMeta('admin-contacts')}
      else if(parts[1]==='users'){showPage('admin-users',true,true);setPageMeta('admin-users')}
      else{showPage('admin',true,true);setPageMeta('admin')}
      break
    case 'academia':
      if(parts[1]){
        window.location.href = 'resource.html?id=' + encodeURIComponent(parts[1])
        return
      }
      goToLandingSection('academia');break
    case 'projects':
      if(parts[1]){
        window.location.href = 'project-detail.html?id=' + encodeURIComponent(parts[1])
        return
      }
      showPage('projects',false);setPageMeta('proyectos');break
    case 'inicio':
      goToLandingSection('hero');break
    case 'servicios':
      goToLandingSection('services');break
    case 'nosotros':
      goToLandingSection('about');break
    case 'precios':
      goToLandingSection('pricing');break
    case 'portafolio':
      goToLandingSection('portfolio');break
    case 'testimonios':
      goToLandingSection('testimonials');break
    case 'contacto':
      goToLandingSection('contact');break
    default:showLanding();setPageMeta('');break
  }
}

function showLanding(){
  currentPage=null
  document.body.classList.remove('page-active')
  var main=document.querySelector('main')
  if(!main)return Promise.resolve()
  main.innerHTML=''
  landingSections.forEach(function(name){
    var div=document.createElement('div')
    div.id='section-'+name
    div.className='section'
    main.appendChild(div)
  })
  return loadSections().then(function(){initScrollReveal()})
}

function goToLandingSection(id){
  var done=function(){
    setPageMeta('')
    scrollToSection(id)
    clearSectionHash()
  }
  if(currentPage!==null){
    showLanding().then(done)
  } else {
    done()
  }
}

function clearSectionHash(){
  var hash=window.location.hash||''
  if(!hash||hash.indexOf('#/')!==0)return
  history.replaceState(null,'',location.pathname+location.search)
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
  var tries=0
  var MAX_TRIES=3
  var cancelled=false
  var scrollKeys={ArrowUp:1,ArrowDown:1,PageUp:1,PageDown:1,Home:1,End:1,' ':1}
  var events=['wheel','touchstart','touchmove','mousedown','keydown']
  function cancel(e){
    if(e.type==='keydown'&&!scrollKeys[e.key])return
    cancelled=true
  }
  events.forEach(function(name){window.addEventListener(name,cancel,{once:true,passive:true})})
  function attempt(){
    if(cancelled)return cleanup()
    var el=document.getElementById('section-'+id)
    if(el){
      var navbar=document.querySelector('.navbar-luxury')
      var offset=navbar?navbar.offsetHeight:0
      var top=el.getBoundingClientRect().top+window.pageYOffset-offset
      var reached=Math.abs(window.pageYOffset-top)<60
      if(tries===0||!reached)scrollIntoViewOffset(el)
    }
    tries++
    if(tries<MAX_TRIES)setTimeout(attempt,tries===1?1200:1500)
    else cleanup()
  }
  function cleanup(){
    events.forEach(function(name){window.removeEventListener(name,cancel)})
  }
  setTimeout(attempt,300)
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
