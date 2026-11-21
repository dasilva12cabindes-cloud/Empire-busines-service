(function(){
  // ===== CSS do menu (+ esconder e-mail e link no ecrã) =====
  var st=document.createElement('style');
  st.textContent=
  '#emailClienteTop,p:has(#linkLojaTexto),p:has(#linkLojaAdmin){display:none!important}'+
  '.secao{scroll-margin-top:70px}'+
  '#menuFundo{position:fixed;inset:0;background:rgba(0,20,28,.65);z-index:1200;opacity:0;pointer-events:none;transition:opacity .25s}'+
  '.menuPainel{position:fixed;top:0;bottom:0;left:0;width:82%;max-width:320px;background:var(--fundo-escuro,#034556);border-right:1px solid var(--borda,rgba(255,255,255,.14));z-index:1201;transform:translateX(-100%);transition:transform .28s;overflow-y:auto;padding-bottom:30px}'+
  '#menuLateral.aberto #menuFundo{opacity:1;pointer-events:auto}'+
  '#menuLateral.aberto .menuPainel{transform:none}'+
  '.menuTopo{display:flex;justify-content:space-between;align-items:center;padding:18px 16px 8px}'+
  '.menuLogo{font-weight:800;letter-spacing:2px;font-size:16px}'+
  '.menuX{background:var(--card,#176a7d);border:1px solid var(--borda,rgba(255,255,255,.14));color:#fff;width:36px;height:36px;border-radius:12px;font-size:16px;cursor:pointer}'+
  '.menuUser{margin:6px 16px 10px;padding:12px 14px;background:var(--card,#176a7d);border-radius:14px;font-size:13px;color:var(--suave,#b9d6dd)}'+
  '.menuTitulo{margin:16px 18px 6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--destaque,#d4af37)}'+
  '.menuPainel nav button{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;border-bottom:1px solid rgba(255,255,255,.07);color:#fff;padding:14px 18px;font-size:15px;font-weight:500;text-align:left;cursor:pointer}'+
  '.menuPainel nav button:active{background:rgba(255,255,255,.08)}';
  document.head.appendChild(st);

  // ===== HTML do menu =====
  var cats=[['perfume','🌸','Perfumes'],['tenis','👟','Ténis'],['roupa','👕','Roupas'],['relogio','⌚','Relógios'],['acessorio','💍','Acessórios']];
  var catsHtml=cats.map(function(c,i){return '<button data-cat="'+c[0]+'" data-i="'+(i+1)+'"><span>'+c[1]+'</span>'+c[2]+'</button>';}).join('');
  var m=document.createElement('div');
  m.id='menuLateral';
  m.innerHTML=
    '<div id="menuFundo"></div>'+
    '<aside class="menuPainel">'+
      '<div class="menuTopo"><div class="menuLogo" id="menuLogo"></div><button class="menuX" data-acao="fechar">✕</button></div>'+
      '<div class="menuUser" id="menuUser"></div>'+
      '<nav>'+
        '<button data-acao="inicio"><span>🏠</span>Início</button>'+
        '<button data-acao="destaques"><span>⭐</span>Destaques</button>'+
        '<div class="menuTitulo">Categorias</div>'+catsHtml+
        '<div class="menuTitulo">Mais</div>'+
        '<button data-acao="whats"><span>💬</span>Falar no WhatsApp</button>'+
        '<button data-acao="partilhar"><span>🔗</span>Partilhar a loja</button>'+
        '<button data-acao="sobre"><span>👑</span>Sobre a loja</button>'+
        '<button data-acao="conta" id="menuConta"></button>'+
      '</nav>'+
    '</aside>';
  document.body.appendChild(m);

  function abrir(){
    var logo=document.getElementById('logoTexto');
    document.getElementById('menuLogo').textContent=logo?logo.innerText:'EMPIRE';
    var logado=!!window.clienteEmail;
    document.getElementById('menuUser').textContent=logado?('👤 '+(window.clienteNome||'Minha conta')):'👤 Visitante · cria conta para comprar';
    document.getElementById('menuConta').innerHTML=logado?'<span>👤</span>Minha conta':'<span>🔐</span>Entrar / Criar conta';
    m.classList.add('aberto');
  }
  function fechar(){ m.classList.remove('aberto'); }
  function irPara(el){
    fechar(); mostrarLoja();
    if(el) setTimeout(function(){ el.scrollIntoView({behavior:'smooth',block:'start'}); },80);
  }
  function secaoDe(id){ var e=document.getElementById(id); return e?e.closest('.secao'):null; }

  m.addEventListener('click',function(e){
    if(e.target.id==='menuFundo') return fechar();
    var b=e.target.closest('button'); if(!b) return;
    if(b.dataset.cat){
      var btns=document.querySelectorAll('.acoes.filtros button');
      fechar(); mostrarLoja();
      if(btns[b.dataset.i]) setFiltro(b.dataset.cat,btns[b.dataset.i]);
      return irPara(secaoDe('produtos'));
    }
    switch(b.dataset.acao){
      case 'fechar': fechar(); break;
      case 'inicio': fechar(); mostrarLoja(); break;
      case 'destaques':
        var d=document.getElementById('areaDestaque');
        irPara(d&&d.style.display!=='none'?d:secaoDe('produtos')); break;
      case 'whats':
        var n=String((window.CFG&&CFG.whats)||'244972370499').replace(/\D/g,'');
        fechar(); window.open('https://wa.me/'+n,'_blank'); break;
      case 'partilhar': fechar(); partilharWhatsAppLoja(); break;
      case 'sobre': irPara(secaoDe('sobreTitulo')); break;
      case 'conta':
        fechar();
        abrirLoginCliente();
        break;
    }
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') fechar(); });

  // ===== Conta: perfil quando ligado + título com o nome atual da loja =====
  var pm=document.createElement('div');
  pm.id='perfilModal'; pm.className='modal';
  pm.innerHTML=
    '<div class="modalBox" style="text-align:center">'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><h3 id="perfilTitulo"></h3><button id="perfilX" style="background:#ff4444;border:0;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer">X</button></div>'+
      '<div id="perfilAvatar" style="width:70px;height:70px;background:var(--destaque,#d4af37);color:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;margin:18px auto 10px"></div>'+
      '<h3 id="perfilNome" style="font-size:20px"></h3>'+
      '<p style="display:flex;justify-content:center;align-items:center;gap:8px;color:#00ff88;font-weight:700;margin:8px 0 18px"><span class="luz-verde"></span>Conectado</p>'+
      '<button class="btn" id="perfilSair" style="background:rgba(0,0,0,.3);color:#fff;border:1px solid rgba(255,255,255,.14)">🚪 Sair da conta</button>'+
    '</div>';
  document.body.appendChild(pm);

  function nomeLoja(){ return (window.LOJA&&window.LOJA.nomeLoja)||'Loja'; }
  function fecharPerfil(){ pm.style.display='none'; }
  function abrirPerfil(){
    var nome=window.clienteNome||'Cliente';
    document.getElementById('perfilTitulo').textContent='👤 Conta '+nomeLoja();
    document.getElementById('perfilNome').textContent=nome;
    document.getElementById('perfilAvatar').textContent=nome.charAt(0).toUpperCase();
    pm.style.display='flex';
  }
  document.getElementById('perfilX').onclick=fecharPerfil;
  pm.addEventListener('click',function(e){ if(e.target===pm) fecharPerfil(); });
  document.getElementById('perfilSair').onclick=function(){ fecharPerfil(); sairCliente(); };

  var loginOriginal=window.abrirLoginCliente;
  window.abrirLoginCliente=function(){
    if(window.clienteEmail){ abrirPerfil(); return; }
    loginOriginal();
    var h=document.querySelector('#clienteModal h3');
    if(h) h.textContent='👤 Conta '+nomeLoja();
  };

  // ===== Liga ao botão ☰ do topo =====
  var hamb=document.querySelector('.topo .iconBtn');
  if(hamb){ hamb.onclick=abrir; hamb.setAttribute('aria-label','Menu'); }
})();
