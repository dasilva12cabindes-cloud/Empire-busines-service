// ===== ERRO VISÍVEL =====
function mostrarErro(msg){ var b=document.getElementById('debugBox'); if(!b) return; b.style.display='block'; b.innerText='⚠️ ERRO: '+msg; var st=document.getElementById('status'); if(st) st.innerText='❌ Erro: '+msg; }

// ===== CONFIG FIREBASE - TEU PROJETO empire-1340b =====
var firebaseConfig = { apiKey: "AIzaSyD9oH4B7B8NeaoxGqh8t-Dv6f5wYzBiD3E", authDomain: "empire-1340b.firebaseapp.com", projectId: "empire-1340b", storageBucket: "empire-1340b.firebasestorage.app", messagingSenderId: "687415738512", appId: "1:687415738512:web:3fdfbaee1f24e5839e9815", measurementId: "G-1HWY3G06P9" };
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(); const db=firebase.firestore();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){});
var ADMIN_EMAIL="dasilva12cabindes@gmail.com";

// ===== ESTADO =====
var carrinho=[]; var todosProdutos=[]; var todosPedidos=[]; var todosClientes=[];
var filtroAtual="todos"; var termoPesquisa="";
var clienteEmail=""; var clienteNome=""; var clienteWhats="";
var modoAdmin=false; var isAdmin=false;
var fotosArray=[]; var editandoId=null; var idPedidoAtual=null;
var produtoSelecionado=null; var comprovativoBase64=""; var comprovativoTipo="";
var LOJA={}; var CFG={};

// ===== UTILS =====
function fmt(v){ return Number(v||0).toLocaleString('pt-AO'); }
function esc(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function normalizarTexto(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function show(el){ var e=document.getElementById(el); if(e) e.style.display='block'; }
function hide(el){ var e=document.getElementById(el); if(e) e.style.display='none'; }
function setTexto(id,txt){ var e=document.getElementById(id); if(e) e.innerText=txt; }
function dataDeHoje(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dataOntem(){ var d=new Date(); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function horaDe(ts){ if(!ts) return ''; var d=new Date(ts); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
function saudacaoPorHora(){ var h=new Date().getHours(); if(h>=5&&h<12) return "Bom dia,"; if(h>=12&&h<18) return "Boa tarde,"; return "Boa noite,"; }
function verSenha(id,btn){ var i=document.getElementById(id); if(!i) return; if(i.type==="password"){ i.type="text"; if(btn) btn.innerText="🙈"; } else { i.type="password"; if(btn) btn.innerText="👁️"; } }
function verImg(src){ var m=document.getElementById('imgModal'); var im=document.getElementById('imgGrande'); im.src=src; m.style.display='flex'; }
function fecharImg(){ document.getElementById('imgModal').style.display='none'; }

// ===== NAVEGAÇÃO =====
function mostrarLoja(){ hide('loginBox'); hide('adminPanel'); show('areaLoja'); window.scrollTo(0,0); }
function mostrarLoginAdmin(){ hide('areaLoja'); hide('adminPanel'); show('loginBox'); }
function mostrarAdmin(){ hide('areaLoja'); hide('loginBox'); show('adminPanel'); mostrarAba('prod'); }
function mostrarAba(aba){ ['prod','ped','rel','loja','pag','cli'].forEach(function(a){ hide('aba'+a.charAt(0).toUpperCase()+a.slice(1)); }); var map={prod:'abaProd',ped:'abaPed',rel:'abaRel',loja:'abaLoja',pag:'abaPag',cli:'abaCli'}; show(map[aba]); ['tabProd','tabPed','tabRel','tabLoja','tabPag','tabCli'].forEach(function(t){ var e=document.getElementById(t); if(e) e.classList.remove('ativo'); }); var tab={prod:'tabProd',ped:'tabPed',rel:'tabRel',loja:'tabLoja',pag:'tabPag',cli:'tabCli'}[aba]; var te=document.getElementById(tab); if(te) te.classList.add('ativo'); }

// ===== SAUDAÇÃO + LUZ VERDE + HEADER =====
function atualizarSaudacaoELuz(){ setTexto('textoSaudacao',saudacaoPorHora()); var logado=!!clienteEmail; var areaLogado=document.getElementById('areaLogado'); var avisoVisitante=document.getElementById('avisoVisitante'); if(logado){ if(areaLogado) areaLogado.style.display='flex'; if(avisoVisitante) avisoVisitante.style.display='none'; } else { if(areaLogado) areaLogado.style.display='none'; if(avisoVisitante) avisoVisitante.style.display='block'; } }
function atualizarHeaderCliente(){
  var area=document.getElementById('areaClienteHeader');
  if(clienteEmail){
    if(area) area.innerHTML='<button class="btnCliente" onclick="mostrarLoja()">👤 '+esc(clienteNome||clienteEmail.split('@')[0])+'</button> <button class="btnSair" onclick="sairCliente()">Sair</button>';
    setTexto('nomeClienteTop',clienteNome||clienteEmail);
    setTexto('emailClienteTop',clienteEmail);
    var cn=document.getElementById('cliNome'); if(cn) cn.value=clienteNome||"";
    var ce=document.getElementById('cliEmailPag'); if(ce) ce.value=clienteEmail||"";
  } else {
    if(area) area.innerHTML='<button class="btnCliente" onclick="abrirLoginCliente()">🔐 Entrar / Criar Conta</button>';
    setTexto('nomeClienteTop',"Visitante!");
    setTexto('emailClienteTop',"Cria conta antes de comprar");
  }
  atualizarSaudacaoELuz();
  renderProdutos();
}

// ===== AUTH =====
auth.onAuthStateChanged(function(u){
  if(!u){ clienteEmail=""; clienteNome=""; clienteWhats=""; isAdmin=false; modoAdmin=false; atualizarHeaderCliente(); return; }
  var email=(u.email||'').toLowerCase();
  clienteEmail=email;
  clienteNome=u.displayName||email.split('@')[0];
  isAdmin=(email===ADMIN_EMAIL);
  modoAdmin=isAdmin;
  atualizarHeaderCliente();
  if(isAdmin){ var b=document.getElementById('btnAdminEscondido'); if(b) b.style.display='block'; }
  db.collection('clientes').doc(u.uid).get().then(function(s){
    if(s.exists){ var d=s.data(); if(d.nome) clienteNome=d.nome; if(d.whats) clienteWhats=d.whats; atualizarHeaderCliente(); }
  }).catch(function(){});
});
function login(){ var e=document.getElementById('email').value.trim().toLowerCase(); var p=document.getElementById('pass').value; if(!e||!p) return setTexto('loginMsg','Preenche e-mail e senha'); auth.signInWithEmailAndPassword(e,p).then(function(){ setTexto('loginMsg',''); if(e===ADMIN_EMAIL){ isAdmin=true; modoAdmin=true; mostrarAdmin(); } else { mostrarLoja(); } }).catch(function(err){ setTexto('loginMsg','Erro: '+err.message); }); }
function logout(){ if(!confirm("Sair do admin?")) return; auth.signOut().then(function(){ isAdmin=false; modoAdmin=false; mostrarLoja(); }); }
function esqueciSenhaAdmin(){ var e=document.getElementById('email').value.trim(); if(!e) return alert("Escreve o teu e-mail primeiro"); auth.sendPasswordResetEmail(e).then(function(){ alert("Link enviado para "+e); }).catch(function(err){ alert(err.message); }); }
function btnAdminClick(){ var u=auth.currentUser; if(u&&(u.email||'').toLowerCase()===ADMIN_EMAIL){ isAdmin=true; modoAdmin=true; mostrarAdmin(); return; } mostrarLoginAdmin(); }
function sairCliente(){ if(!confirm("Queres sair da conta?")) return; auth.signOut().then(function(){ clienteEmail=""; clienteNome=""; clienteWhats=""; atualizarHeaderCliente(); alert("Saíste da conta"); }); }

// ===== CONTA CLIENTE =====
function abrirLoginCliente(){ if(clienteEmail){ return; } var m=document.getElementById('clienteModal'); if(m) m.style.display='flex'; mostrarTelaLogin(); }
function fecharLoginCliente(){ var m=document.getElementById('clienteModal'); if(m) m.style.display='none'; }
function mostrarTelaLogin(){ hide('telaCriar'); hide('telaEsqueceu'); show('telaLogin'); }
function mostrarTelaCriar(){ hide('telaLogin'); hide('telaEsqueceu'); show('telaCriar'); }
function esqueceuSenha(){ hide('telaLogin'); hide('telaCriar'); show('telaEsqueceu'); }
function entrarCliente(){ var e=document.getElementById('cliEmail').value.trim().toLowerCase(); var p=document.getElementById('cliSenha').value; if(!e||!p) return setTexto('msgCliente','Preenche e-mail e senha'); auth.signInWithEmailAndPassword(e,p).then(function(){ fecharLoginCliente(); alert("Bem-vindo! ✅"); }).catch(function(err){ setTexto('msgCliente','Erro: '+err.message); }); }
function criarContaCliente(){ var nome=document.getElementById('cliNomeConta').value.trim(); var email=document.getElementById('cliEmailCriar').value.trim().toLowerCase(); var whats=document.getElementById('cliWhatsConta').value.trim(); var s1=document.getElementById('cliSenhaCriar').value; var s2=document.getElementById('cliSenhaConfirmar').value; if(!nome||!email||!s1) return setTexto('msgCliente','Preenche nome, e-mail e senha'); if(s1.length<6) return setTexto('msgCliente','Senha mínima 6 caracteres'); if(s1!==s2) return setTexto('msgCliente','Senhas diferentes'); auth.createUserWithEmailAndPassword(email,s1).then(function(cred){ return db.collection('clientes').doc(cred.user.uid).set({nome:nome,email:email,whats:whats,criado:Date.now()}); }).then(function(){ clienteNome=nome; clienteWhats=whats; fecharLoginCliente(); atualizarHeaderCliente(); alert("Conta criada! ✅"); }).catch(function(err){ setTexto('msgCliente','Erro: '+err.message); }); }
function enviarRecuperacao(){ var e=document.getElementById('cliEmailEsqueceu').value.trim(); if(!e) return setTexto('msgCliente','Escreve o teu e-mail'); auth.sendPasswordResetEmail(e).then(function(){ setTexto('msgCliente','Link enviado! Verifica o teu e-mail.'); }).catch(function(err){ setTexto('msgCliente','Erro: '+err.message); }); }

// ===== PRODUTOS =====
function filtrar(){ termoPesquisa=normalizarTexto(document.getElementById('pesquisa').value); renderProdutos(); }
function setFiltro(f,btn){ filtroAtual=normalizarTexto(f); termoPesquisa=""; var inp=document.getElementById('pesquisa'); if(inp) inp.value=""; document.querySelectorAll('.filtros button').forEach(function(b){ b.classList.remove('ativo'); }); if(btn) btn.classList.add('ativo'); renderProdutos(); }
function cardHtml(o,destaque){ var d=o.data; var qtd=Number(d.stock||0); var fotos=d.fotos||(d.foto?[d.foto]:[]); var img=fotos[0]||''; var badge=""; if(d.destaque) badge='<span class="badgeDestaque">⭐ DESTAQUE</span>'; else if(d.criado&&Date.now()-d.criado<7*24*3600*1000) badge='<span class="badgeNovo">NOVO</span>'; var btnComprar=''; if(!clienteEmail){ btnComprar='<button class="btnBloqueado" onclick="abrirLoginCliente()">🔐 Entrar para comprar</button>'; } else { btnComprar='<button onclick="addCarrinho(\''+o.id+'\')">🛒 ADICIONAR</button>'; } return '<div class="card'+(destaque?' destaqueCard':'')+'">'+badge+'<img class="main" src="'+img+'" onclick="verImg(\''+img+'\')"><div class="info"><h3>'+esc(d.nome)+'</h3><p>'+esc(d.desc||'')+'</p><div class="precoRow"><span class="preco">'+fmt(d.preco)+' Kz</span><span style="font-size:11px;color:#fff">'+(qtd>0?('Stock: '+qtd):'Esgotado')+'</span></div>'+btnComprar+'</div></div>'; }
function renderProdutos(){
  var div=document.getElementById('produtos');
  var lista=todosProdutos.filter(function(p){
    var cat=normalizarTexto(p.data.categoria||'');
    var nome=normalizarTexto(p.data.nome||'');
    var desc=normalizarTexto(p.data.desc||'');
    var okFiltro=filtroAtual=='todos'||cat==filtroAtual||nome.indexOf(filtroAtual)>=0||desc.indexOf(filtroAtual)>=0;
    var okPesq=!termoPesquisa||nome.indexOf(termoPesquisa)>=0||desc.indexOf(termoPesquisa)>=0;
    return okFiltro&&okPesq;
  });
  setTexto('qtdMostra',lista.length+" produto(s)");
  var se=document.getElementById('statProd'); if(se) se.innerText=todosProdutos.length;
  var destaques=todosProdutos.filter(function(o){ return o.data.destaque; });
  var areaD=document.getElementById('areaDestaque'); var divD=document.getElementById('produtosDestaque');
  if(destaques.length&&areaD&&divD){ areaD.style.display='block'; divD.innerHTML=destaques.map(function(o){ return cardHtml(o,true); }).join(''); }
  else if(areaD) areaD.style.display='none';
  if(!div) return;
  if(!lista.length){ div.innerHTML='<div style="text-align:center;padding:40px;color:#fff">Nenhum produto nesta categoria.</div>'; return; }
  div.innerHTML=lista.map(function(o){ return cardHtml(o,false); }).join('');
}
function lerFotos(ev){ var files=ev.target.files; fotosArray=[]; var prev=document.getElementById('previewFotos'); if(prev) prev.innerHTML=''; if(!files.length) return; Array.from(files).slice(0,5).forEach(function(f){ var r=new FileReader(); r.onload=function(e){ fotosArray.push(e.target.result); if(prev){ var w=document.createElement('div'); w.className='miniWrap'; w.innerHTML='<img src="'+e.target.result+'">'; prev.appendChild(w); } }; r.readAsDataURL(f); }); }
function salvarProduto(){
  var nome=document.getElementById('nome').value.trim();
  var preco=document.getElementById('preco').value;
  var desc=document.getElementById('desc').value.trim();
  var dest=document.getElementById('chkDestaque').checked;
  var cat=document.getElementById('categoria').value||"outro";
  var stockEl=document.getElementById('stock');
  var stock=stockEl?Number(stockEl.value||0):0;
  if(!nome||!preco) return alert("Preenche nome e preço");
  if(!fotosArray.length) return alert("Escolhe pelo menos 1 foto!");
  var dados={nome:nome,preco:Number(preco),fotos:fotosArray,foto:fotosArray[0],desc:desc,destaque:dest,categoria:cat,stock:stock};
  if(editandoId){
    db.collection("produtos").doc(editandoId).update(dados).then(function(){ alert("Editado ✅"); cancelarEdicao(); }).catch(function(e){ alert("Erro: "+e.message); });
  } else {
    dados.criado=Date.now();
    db.collection("produtos").add(dados).then(function(){ alert("Adicionado ✅ - Já aparece para os clientes!"); cancelarEdicao(); }).catch(function(e){ alert("Erro ao salvar: "+e.message); });
  }
}
function editar(id){ var o=todosProdutos.find(function(x){ return x.id===id; }); if(!o) return; var p=o.data; editandoId=id; document.getElementById('nome').value=p.nome||""; document.getElementById('preco').value=p.preco||""; document.getElementById('desc').value=p.desc||""; document.getElementById('categoria').value=p.categoria||"outro"; document.getElementById('chkDestaque').checked=!!p.destaque; var st=document.getElementById('stock'); if(st) st.value=(p.stock!=null?p.stock:""); fotosArray=p.fotos||(p.foto?[p.foto]:[]); var prev=document.getElementById('previewFotos'); if(prev) prev.innerHTML=fotosArray.map(function(f){ return '<div class="miniWrap"><img src="'+f+'"></div>'; }).join(''); setTexto('adminTitle','Editar Produto'); var bs=document.getElementById('btnSalvar'); if(bs) bs.innerText="💾 SALVAR EDIÇÃO"; show('btnCancelar'); window.scrollTo(0,0); }
function cancelarEdicao(){ editandoId=null; fotosArray=[]; ['nome','preco','desc','stock'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=""; }); var c=document.getElementById('chkDestaque'); if(c) c.checked=false; var prev=document.getElementById('previewFotos'); if(prev) prev.innerHTML=''; setTexto('adminTitle','Adicionar Produto'); var bs=document.getElementById('btnSalvar'); if(bs) bs.innerText="+ ADICIONAR PRODUTO À LOJA"; hide('btnCancelar'); }
function apagar(id){ if(!confirm("Apagar este produto?")) return; db.collection("produtos").doc(id).delete(); }
function renderProdutosAdmin(){ var div=document.getElementById('produtosAdmin'); if(!div) return; if(!todosProdutos.length){ div.innerHTML='<p class="small">Sem produtos.</p>'; return; } div.innerHTML=todosProdutos.map(function(o){ var d=o.data; var img=(d.fotos&&d.fotos[0])||d.foto||''; return '<div class="item"><img src="'+img+'"><div class="itemInfo"><b>'+esc(d.nome)+'</b><span>'+fmt(d.preco)+' Kz • Stock: '+(d.stock!=null?d.stock:'-')+' • '+(d.categoria||'')+'</span></div><button class="btn" style="width:auto;margin:0" onclick="editar(\''+o.id+'\')">✏️</button><button class="btn" style="width:auto;margin:0;background:#ff4444;color:#fff" onclick="apagar(\''+o.id+'\')">🗑️</button></div>'; }).join(''); }

// ===== CARRINHO =====
function addCarrinho(id){ var o=todosProdutos.find(function(x){ return x.id===id; }); if(!o) return; if(!clienteEmail) return abrirLoginCliente(); var ex=carrinho.find(function(c){ return c.id===id; }); if(ex) ex.qtd++; else carrinho.push({id:id,nome:o.data.nome,preco:o.data.preco,foto:(o.data.fotos&&o.data.fotos[0])||o.data.foto||'',qtd:1}); atualizarCarrinho(); alert(o.data.nome+" adicionado! ✅"); }
function atualizarCarrinho(){ var total=carrinho.reduce(function(s,c){ return s+c.preco*c.qtd; },0); var qtd=carrinho.reduce(function(s,c){ return s+c.qtd; },0); setTexto('cartCount',qtd); var ct=document.getElementById('cartCountTop'); if(ct) ct.innerText=qtd; setTexto('cartTotal',"Total: "+fmt(total)+" Kz"); var div=document.getElementById('cartItems'); if(!div) return; if(!carrinho.length){ div.innerHTML='<p class="small">Carrinho vazio.</p>'; return; } div.innerHTML=carrinho.map(function(c,i){ return '<div class="item"><img src="'+c.foto+'"><div class="itemInfo"><b>'+esc(c.nome)+'</b><span>'+fmt(c.preco)+' Kz</span></div><div class="qtdBox"><button class="qtdBtn menos" onclick="diminuirQtd('+i+')">−</button><span class="qtdNum">'+c.qtd+'</span><button class="qtdBtn mais" onclick="aumentarQtd('+i+')">+</button></div><div class="itemTotal"><b>'+fmt(c.preco*c.qtd)+' Kz</b><br><span style="cursor:pointer;color:#ff8888" onclick="removerItemCarrinho('+i+')">Remover</span></div></div>'; }).join(''); }
function aumentarQtd(i){ carrinho[i].qtd++; atualizarCarrinho(); }
function diminuirQtd(i){ if(carrinho[i].qtd>1) carrinho[i].qtd--; else carrinho.splice(i,1); atualizarCarrinho(); }
function removerItemCarrinho(i){ if(!confirm("Remover este item?")) return; carrinho.splice(i,1); atualizarCarrinho(); }
function verCarrinho(){ atualizarCarrinho(); var m=document.getElementById('cartModal'); if(m) m.style.display='flex'; }
function fecharCarrinho(){ var m=document.getElementById('cartModal'); if(m) m.style.display='none'; }

// ===== PAGAMENTO + RECIBO COMPLETO RESTAURADO =====
function abrirPagamento(){ if(!carrinho.length) return alert("Carrinho vazio"); if(!clienteEmail) return abrirLoginCliente(); fecharCarrinho(); var total=carrinho.reduce(function(s,c){ return s+c.preco*c.qtd; },0); var resumo=carrinho.map(function(c){ return c.nome+" x"+c.qtd+" = "+fmt(c.preco*c.qtd)+" Kz"; }).join("\n"); setTexto('pagResumo',resumo+"\n----------------\nTOTAL: "+fmt(total)+" Kz"); setTexto('pagCliente',clienteNome+" • "+clienteEmail); var m=document.getElementById('pagModal'); if(m) m.style.display='flex'; }
function fecharPagamento(){ var m=document.getElementById('pagModal'); if(m) m.style.display='none'; }
function recuarParaCarrinho(){ fecharPagamento(); verCarrinho(); }
function mostrarDadosPag(){ var met=document.getElementById('metodoPag').value; var box=document.getElementById('infoPag'); if(!met){ box.style.display='none'; return; } var txt=""; if(met==="Unitel Money") txt="Unitel Money\nNúmero: "+(CFG.unitel||"-")+"\nNome: "+(CFG.nomeUnitel||"-"); if(met==="Multicaixa Express") txt="Multicaixa Express\nNúmero: "+(CFG.express||"-")+"\nNome: "+(CFG.nomeExpress||"-"); if(met==="PayPay") txt="PayPay\nNúmero: "+(CFG.paypay||"-")+"\nNome: "+(CFG.nomePaypay||"-"); if(met==="Transferência via IBAN") txt="Transferência\nIBAN: "+(CFG.iban||"-")+"\nBanco: "+(CFG.banco||"-")+"\nNome: "+(CFG.nomeBanco||"-"); box.innerText=txt; box.style.display='block'; }
function lerComprovativo(ev){ var f=ev.target.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(e){ comprovativoBase64=e.target.result; comprovativoTipo=f.type||""; var box=document.getElementById('prevCompBox'); if(box){ if(comprovativoTipo.indexOf('pdf')>=0) box.innerHTML='<p class="small">PDF carregado ✅</p>'; else box.innerHTML='<img src="'+comprovativoBase64+'" class="comp">'; } setTexto('compMsg','Comprovativo carregado ✅'); }; r.readAsDataURL(f); }
function confirmarPedido(){
  if(!carrinho.length) return alert("Carrinho vazio");
  var nome=document.getElementById('cliNome').value.trim()||clienteNome||"Cliente";
  var whats=document.getElementById('cliWhats').value.trim()||clienteWhats||"";
  var emailPag=document.getElementById('cliEmailPag').value.trim()||clienteEmail||"";
  var metodo=document.getElementById('metodoPag').value;
  if(!metodo) return alert("Escolhe o método de pagamento");
  if(!comprovativoBase64) return alert("Sube o comprovativo primeiro");
  var total=carrinho.reduce(function(s,c){ return s+c.preco*c.qtd; },0);
  var itens=carrinho.map(function(c){ return {id:c.id,nome:c.nome,preco:c.preco,qtd:c.qtd,foto:c.foto}; });
  var pedidoLocal={clienteNome:nome,clienteEmail:emailPag,clienteWhats:whats,metodo:metodo,itens:itens,total:total,estado:"pendente",comprovativo:comprovativoBase64,criado:Date.now(),data:dataDeHoje()};
  db.collection("pedidos").add(pedidoLocal).then(function(doc){
    var num=doc.id.slice(-6).toUpperCase();
    carrinho=[]; comprovativoBase64=""; comprovativoTipo=""; atualizarCarrinho(); fecharPagamento();
    var msg="Olá "+(LOJA.nomeLoja||"EMPIRE")+"! Fiz um pedido #"+num+" de "+fmt(total)+" Kz. Método: "+metodo;
    var wa=(CFG.whats||'244972370499').replace(/\D/g,'');
    window.open('https://wa.me/'+wa+'?text='+encodeURIComponent(msg),'_blank');
    gerarRecibo(pedidoLocal,num);
  }).catch(function(e){ alert("Erro: "+e.message); });
}
function gerarRecibo(p,num){
  var w=window.open('','_blank');
  if(!w){ alert("Permite popups para ver o recibo"); return; }
  var itens=(p.itens||[]).map(function(i){
    return '<tr><td style="text-align:left">'+esc(i.nome)+'</td><td>x'+i.qtd+'</td><td style="text-align:right">'+fmt(i.preco*i.qtd)+' Kz</td></tr>';
  }).join('');
  var html='<html><head><title>Recibo '+num+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial;padding:20px;color:#000;background:#fff}h2{color:#034556}table{width:100%;border-collapse:collapse;margin:15px 0}td{border-bottom:1px solid #ddd;padding:10px}.topo{border-bottom:3px solid #d4af37;padding-bottom:10px}.total{font-size:20px;font-weight:800}.btn{margin-top:20px;padding:14px 20px;background:#d4af37;border:0;border-radius:10px;font-weight:800;font-size:16px}</style></head><body>'
  +'<div class="topo"><h2>'+esc(LOJA.nomeLoja||'EMPIRE')+' 👑</h2><p>'+esc(LOJA.sloganLoja||'Loja Oficial')+'</p></div>'
  +'<h3>Recibo #'+num+'</h3>'
  +'<p><b>Cliente:</b> '+esc(p.clienteNome||'')+'</p>'
  +'<p><b>WhatsApp:</b> '+esc(p.clienteWhats||'')+'</p>'
  +'<p><b>E-mail:</b> '+esc(p.clienteEmail||'')+'</p>'
  +'<p><b>Método:</b> '+esc(p.metodo||'')+' • <b>Estado:</b> '+esc(p.estado||'pendente')+'</p>'
  +'<p><b>Data:</b> '+new Date(p.criado||Date.now()).toLocaleString('pt-PT')+'</p>'
  +'<table><tr><th style="text-align:left">Produto</th><th>Qtd</th><th style="text-align:right">Valor</th></tr>'+itens+'</table>'
  +'<p class="total">TOTAL: '+fmt(p.total)+' Kz</p>'
  +'<p>Obrigado pela preferência! 🙏</p>'
  +'<button class="btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>'
  +'</body></html>';
  w.document.write(html);
  w.document.close();
}
function verReciboPedido(id){
  var o=todosPedidos.find(function(x){ return x.id===id; });
  if(!o) return;
  gerarRecibo(o.data, o.id.slice(-6).toUpperCase());
}

// ===== ADMIN - PEDIDOS =====
function renderPedidos(){
  var div=document.getElementById('listaPedidos'); if(!div) return;
  setTexto('pedCount',todosPedidos.length);
  if(!todosPedidos.length){ div.innerHTML='<p class="small">Sem pedidos.</p>'; return; }
  div.innerHTML=todosPedidos.map(function(o){ var d=o.data; var cls=d.estado==='pendente'?'estadoPendente':(d.estado==='confirmado'?'estadoConfirmado':'estadoRecusado'); var itens=(d.itens||[]).map(function(i){ return '<div class="itemPedido"><img src="'+(i.foto||'')+'"><div><b>'+esc(i.nome)+'</b><br>'+fmt(i.preco)+' Kz x '+i.qtd+' = <span>'+fmt(i.preco*i.qtd)+' Kz</span></div></div>'; }).join(''); var comp=d.comprovativo?('<img src="'+d.comprovativo+'" class="comp" onclick="verImg(\''+d.comprovativo+'\')">'): '<p class="small">Sem comprovativo</p>'; return '<div class="pedidoCard"><b style="color:#fff">Pedido #'+o.id.slice(-6).toUpperCase()+'</b> <span class="'+cls+'">'+esc(d.estado)+'</span><p class="small" style="color:#fff!important">'+esc(d.clienteNome)+' • '+esc(d.clienteWhats||'')+' • '+esc(d.clienteEmail||'')+' • '+horaDe(d.criado)+'</p><div class="itensPedido">'+itens+'</div>'+comp+'<p style="color:#fff"><b>Total: '+fmt(d.total)+' Kz</b> • '+esc(d.metodo||'')+'</p><div style="display:flex;gap:8px"><button class="btn" onclick="confirmarPedidoAdmin(\''+o.id+'\')">✅ Confirmar</button><button class="btn" style="background:#ff4444;color:#fff" onclick="recusarPedido(\''+o.id+'\')">❌ Recusar</button></div><button class="btn" onclick="verReciboPedido(\''+o.id+'\')">🧾 Ver Recibo do Cliente</button><button class="btn" style="background:#333;color:#fff" onclick="apagarPedido(\''+o.id+'\')">🗑️ Apagar</button></div>'; }).join('');
}
function confirmarPedidoAdmin(id){ db.collection("pedidos").doc(id).update({estado:"confirmado"}); }
function recusarPedido(id){ if(!confirm("Recusar este pedido?")) return; db.collection("pedidos").doc(id).update({estado:"recusado"}); }
function apagarPedido(id){ if(!confirm("Apagar este pedido?")) return; db.collection("pedidos").doc(id).delete(); }

// ===== ADMIN - CLIENTES =====
function renderClientes(){ var div=document.getElementById('listaClientes'); if(!div) return; setTexto('cliCount',todosClientes.length); if(!todosClientes.length){ div.innerHTML='<p class="small">Sem clientes.</p>'; return; } div.innerHTML=todosClientes.map(function(o){ var d=o.data; return '<div class="item"><div class="itemInfo"><b style="color:#fff">'+esc(d.nome||'Cliente')+'</b><span style="color:#fff!important">'+esc(d.email||'')+' • '+esc(d.whats||'')+'</span></div></div>'; }).join(''); }

// ===== RELATÓRIO =====
function verHoje(){ var inp=document.getElementById('dataRel'); if(inp) inp.value=dataDeHoje(); atualizarRelatorio(dataDeHoje()); }
function verOntem(){ var inp=document.getElementById('dataRel'); if(inp) inp.value=dataOntem(); atualizarRelatorio(dataOntem()); }
function atualizarRelatorio(dataSel){
  if(!dataSel) dataSel=dataDeHoje();
  setTexto('dataSelecionadaMsg','A mostrar: '+dataSel);
  var doDia=todosPedidos.filter(function(o){ return o.data.data===dataSel; });
  var total=0, pend=0, rec=0;
  doDia.forEach(function(o){ if(o.data.estado!=='recusado') total+=Number(o.data.total||0); if(o.data.estado==='pendente') pend++; if(o.data.estado==='recusado') rec++; });
  setTexto('relTotal',fmt(total)+' Kz'); setTexto('relQtd',doDia.filter(function(o){ return o.data.estado!=='recusado'; }).length); setTexto('relPend',pend); setTexto('relRec',rec);
  var totalGeral=0; todosPedidos.forEach(function(o){ if(o.data.estado!=='recusado') totalGeral+=Number(o.data.total||0); });
  setTexto('relTotalGeral',fmt(totalGeral)+' Kz'); setTexto('relQtdGeral',todosPedidos.filter(function(o){ return o.data.estado!=='recusado'; }).length);
  var listaRel=document.getElementById('listaRel'); if(listaRel){ listaRel.innerHTML=doDia.length?doDia.map(function(o){ return '<div class="relItem"><div><b>#'+o.id.slice(-6).toUpperCase()+' • '+esc(o.data.clienteNome)+'</b><br><span class="small">'+fmt(o.data.total)+' Kz • '+esc(o.data.estado)+'</span></div></div>'; }).join(''):'<p class="small">Sem vendas neste dia.</p>'; }
  var cont={}; todosPedidos.forEach(function(o){ (o.data.itens||[]).forEach(function(i){ cont[i.nome]=(cont[i.nome]||0)+i.qtd; }); });
  var top=Object.keys(cont).map(function(k){ return {nome:k,qtd:cont[k]}; }).sort(function(a,b){ return b.qtd-a.qtd; }).slice(0,5);
  var listaTop=document.getElementById('listaTop'); if(listaTop){ listaTop.innerHTML=top.length?top.map(function(t){ return '<div class="relItem"><div><b>'+esc(t.nome)+'</b> — '+t.qtd+' vendidos</div></div>'; }).join(''):'<p class="small">Sem vendas ainda.</p>'; }
}
function gerarRelatorioMensal(){ var w=window.open('','_blank'); if(!w) return; var totalGeral=0; todosPedidos.forEach(function(o){ if(o.data.estado!=='recusado') totalGeral+=Number(o.data.total||0); }); w.document.write('<html><head><title>Relatório</title><style>body{font-family:Arial;padding:20px;color:#000;background:#fff}</style></head><body><h2>Relatório - '+(LOJA.nomeLoja||'EMPIRE')+'</h2><p>Total geral: '+fmt(totalGeral)+' Kz</p><p>Total pedidos: '+todosPedidos.length+'</p></body></html>'); w.document.close(); }

// ===== LOJA / PAGAMENTOS =====
function aplicarLoja(){
  var nome=(LOJA.nomeLoja||'EMPIRE'); setTexto('logoTexto',nome); setTexto('sobreTitulo',LOJA.sobreTitulo||nome); setTexto('sobreTexto',LOJA.sobreTexto||''); setTexto('visaoTexto',LOJA.visao||''); setTexto('missaoTexto',LOJA.missao||''); setTexto('sobreExtra',LOJA.sobreExtra||''); setTexto('footerTexto',LOJA.footer||''); setTexto('logoSlogan',LOJA.sloganLoja||''); var lt=document.getElementById('linkLojaTexto'); if(lt) lt.innerText=location.href; var la=document.getElementById('linkLojaAdmin'); if(la) la.innerText=location.href;
  var cfgNome=document.getElementById('cfgNomeLoja'); if(cfgNome) cfgNome.value=LOJA.nomeLoja||'';
  var cfgSlog=document.getElementById('cfgSloganLoja'); if(cfgSlog) cfgSlog.value=LOJA.sloganLoja||'';
  var bT=document.getElementById('cfgBannerTitulo'); if(bT) bT.value=LOJA.bannerTitulo||'';
  var bS=document.getElementById('cfgBannerSub'); if(bS) bS.value=LOJA.bannerSub||'';
  var sT=document.getElementById('cfgSobreTitulo'); if(sT) sT.value=LOJA.sobreTitulo||'';
  var sX=document.getElementById('cfgSobreTexto'); if(sX) sX.value=LOJA.sobreTexto||'';
  var v=document.getElementById('cfgVisao'); if(v) v.value=LOJA.visao||'';
  var m=document.getElementById('cfgMissao'); if(m) m.value=LOJA.missao||'';
  var se=document.getElementById('cfgSobreExtra'); if(se) se.value=LOJA.sobreExtra||'';
  var f=document.getElementById('cfgFooter'); if(f) f.value=LOJA.footer||'';
}
function salvarLoja(){ var dados={nomeLoja:document.getElementById('cfgNomeLoja').value.trim()||'EMPIRE',sloganLoja:document.getElementById('cfgSloganLoja').value.trim(),bannerTitulo:document.getElementById('cfgBannerTitulo').value.trim(),bannerSub:document.getElementById('cfgBannerSub').value.trim(),sobreTitulo:document.getElementById('cfgSobreTitulo').value.trim(),sobreTexto:document.getElementById('cfgSobreTexto').value.trim(),visao:document.getElementById('cfgVisao').value.trim(),missao:document.getElementById('cfgMissao').value.trim(),sobreExtra:document.getElementById('cfgSobreExtra').value.trim(),footer:document.getElementById('cfgFooter').value.trim()}; LOJA=dados; db.collection("config").doc("loja").set(dados).then(function(){ aplicarLoja(); alert("Loja salva ✅"); }).catch(function(e){ alert("Erro: "+e.message); }); }
function aplicarConfigPag(){ var m={cfgExpress:'express',cfgNomeExpress:'nomeExpress',cfgUnitel:'unitel',cfgNomeUnitel:'nomeUnitel',cfgPaypay:'paypay',cfgNomePaypay:'nomePaypay',cfgIban:'iban',cfgBanco:'banco',cfgNomeBanco:'nomeBanco',cfgWhats:'whats'}; Object.keys(m).forEach(function(id){ var e=document.getElementById(id); if(e) e.value=CFG[m[id]]||''; }); }
function salvarConfigPag(){ var dados={express:document.getElementById('cfgExpress').value.trim(),nomeExpress:document.getElementById('cfgNomeExpress').value.trim(),unitel:document.getElementById('cfgUnitel').value.trim(),nomeUnitel:document.getElementById('cfgNomeUnitel').value.trim(),paypay:document.getElementById('cfgPaypay').value.trim(),nomePaypay:document.getElementById('cfgNomePaypay').value.trim(),iban:document.getElementById('cfgIban').value.trim(),banco:document.getElementById('cfgBanco').value.trim(),nomeBanco:document.getElementById('cfgNomeBanco').value.trim(),whats:document.getElementById('cfgWhats').value.trim()}; CFG=dados; db.collection("config").doc("pagamentos").set(dados).then(function(){ alert("Pagamentos salvos ✅"); }).catch(function(e){ alert("Erro: "+e.message); }); }
function lerLogo(ev){ var f=ev.target.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(e){ var img=document.getElementById('prevLogo'); if(img){ img.src=e.target.result; img.style.display='block'; } LOJA.logo=e.target.result; }; r.readAsDataURL(f); }
function removerLogo(){ LOJA.logo=""; var img=document.getElementById('prevLogo'); if(img) img.style.display='none'; }
function lerBanner(ev){ var f=ev.target.files[0]; if(!f) return; var r=new FileReader(); r.onload=function(e){ var img=document.getElementById('prevBanner'); if(img){ img.src=e.target.result; img.style.display='block'; } LOJA.banner=e.target.result; }; r.readAsDataURL(f); }
function removerBanner(){ LOJA.banner=""; var img=document.getElementById('prevBanner'); if(img) img.style.display='none'; }
function copiarLinkLoja(){ var link=location.href; if(navigator.clipboard) navigator.clipboard.writeText(link).then(function(){ alert("Link copiado ✅"); }); else alert(link); }
function partilharWhatsAppLoja(){ var wa=(CFG.whats||'244972370499').replace(/\D/g,''); window.open('https://wa.me/'+wa+'?text='+encodeURIComponent('Vê a minha loja: '+location.href),'_blank'); }

// ===== LISTENERS FIRESTORE =====
db.collection("produtos").onSnapshot(function(snap){ todosProdutos=[]; snap.forEach(function(d){ todosProdutos.push({id:d.id,data:d.data()}); }); todosProdutos.sort(function(a,b){ return (b.data.criado||0)-(a.data.criado||0); }); renderProdutos(); renderProdutosAdmin(); var st=document.getElementById('status'); if(st) st.innerText=todosProdutos.length?todosProdutos.length+" produtos carregados ✅":"Sem produtos ainda. Adiciona o primeiro!"; },function(e){ mostrarErro(e.message); });
db.collection("pedidos").orderBy("criado","desc").onSnapshot(function(snap){ todosPedidos=[]; snap.forEach(function(d){ todosPedidos.push({id:d.id,data:d.data()}); }); renderPedidos(); atualizarRelatorio(document.getElementById('dataRel')?document.getElementById('dataRel').value||dataDeHoje():dataDeHoje()); },function(){});
db.collection("clientes").onSnapshot(function(snap){ todosClientes=[]; snap.forEach(function(d){ todosClientes.push({id:d.id,data:d.data()}); }); renderClientes(); },function(){});
db.collection("config").doc("loja").onSnapshot(function(s){ if(s.exists){ LOJA=s.data(); aplicarLoja(); } });
db.collection("config").doc("pagamentos").onSnapshot(function(s){ if(s.exists){ CFG=s.data(); aplicarConfigPag(); } });

// ===== INÍCIO =====
atualizarSaudacaoELuz();
var inpData=document.getElementById('dataRel'); if(inpData) inpData.value=dataDeHoje();
atualizarRelatorio(dataDeHoje());