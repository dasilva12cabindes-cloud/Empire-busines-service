// ===== FIX LISSANTE - LIGA HTML + SCRIPT.JS =====
// 1. Menu - funciona dos 2 jeitos
function abrirMenuLateral(){ var m=document.getElementById('menuLateral'); if(m){ m.style.left='0'; m.classList.add('aberto'); } var o=document.getElementById('overlayMenu'); if(o){ o.style.display='block'; o.classList.add('mostrar'); } }
function fecharMenuLateral(){ var m=document.getElementById('menuLateral'); if(m){ m.style.left='-280px'; m.classList.remove('aberto'); } var o=document.getElementById('overlayMenu'); if(o){ o.style.display='none'; o.classList.remove('mostrar'); } }
function abrirMenuAdmin(){ var m=document.getElementById('menuAdminLateral'); if(m){ m.style.left='0'; } var o=document.getElementById('overlayMenuAdmin'); if(o) o.style.display='block'; }
function fecharMenuAdmin(){ var m=document.getElementById('menuAdminLateral'); if(m){ m.style.left='-280px'; } var o=document.getElementById('overlayMenuAdmin'); if(o) o.style.display='none'; }

// 2. Alias - variantes passam a funcionar
function adicionarAoCarrinho(idOuNome){
  // Se vier ID, usa addCarrinho. Se vier nome, procura o produto
  var o=todosProdutos.find(function(x){ return x.id===idOuNome || x.data.nome===idOuNome || (typeof idOuNome==='string' && idOuNome.indexOf(x.data.nome)>=0); });
  if(o) return addCarrinho(o.id);
  if(typeof idOuNome==='string' && produtoSelecionado) return addCarrinho(produtoSelecionado.id);
}

// 3. Abas Admin - inclui Notificação
function irParaAbaAdmin(aba){
  fecharMenuAdmin();
  var mapas={prod:'abaProd',ped:'abaPed',notif:'abaNotif',stock:'abaStock',rel:'abaRel',loja:'abaLoja',pag:'abaPag',cli:'abaCli'};
  Object.keys(mapas).forEach(function(k){ var e=document.getElementById(mapas[k]); if(e) e.style.display='none'; });
  if(mapas[aba]){ var el=document.getElementById(mapas[aba]); if(el) el.style.display='block'; }
  if(aba==='notif' && typeof carregarNotificacoesAdmin==='function') carregarNotificacoesAdmin();
  if(aba==='stock') atualizarListaStock();
  window.scrollTo(0,0);
}

// 4. Salvar Cores / Tamanhos no Firebase
var _salvarOriginal = salvarProduto;
salvarProduto = function(){
  var coresEl=document.getElementById('prodCores');
  var tamEl=document.getElementById('prodTamanhos');
  window._coresTemp = coresEl ? coresEl.value : '';
  window._tamanhosTemp = tamEl ? tamEl.value : '';
  // Guarda para depois o onSnapshot não perder
  var nomeEl=document.getElementById('nome');
  var precoEl=document.getElementById('preco');
  if(nomeEl && precoEl && nomeEl.value && precoEl.value && fotosArray.length){
    var dadosExtra={cores:window._coresTemp, tamanhos:window._tamanhosTemp, coresStr:window._coresTemp, tamanhosStr:window._tamanhosTemp};
    // Se estiver a editar, atualiza logo as cores
    if(editandoId){
      db.collection("produtos").doc(editandoId).update(dadosExtra).catch(function(){});
    } else {
      // Ao criar, guarda numa var para o listener usar no próximo render
      window._ultimasCores = dadosExtra;
      // Tenta atualizar o último produto criado após 1.5s
      setTimeout(function(){
        if(todosProdutos.length && window._ultimasCores){
          var ultimo=todosProdutos[0];
          db.collection("produtos").doc(ultimo.id).update(window._ultimasCores).catch(function(){});
        }
      }, 1500);
    }
  }
  return _salvarOriginal();
};

// 5. Card passa a abrir variantes se tiver cor/tamanho
var _cardOriginal = cardHtml;
cardHtml = function(o,destaque){
  var d=o.data;
  var cores=d.cores||d.coresStr||'';
  var tams=d.tamanhos||d.tamanhosStr||'';
  if((cores||tams) && clienteEmail){
    // Troca o botão ADICIONAR por ABRIR VARIANTES
    var html=_cardOriginal(o,destaque);
    var foto=(d.fotos&&d.fotos[0])||d.foto||'';
    var btnNovo='<button onclick="abrirVariantes(\''+esc(d.nome).replace(/'/g,"\\'")+'\','+d.preco+',\''+foto+'\',\''+String(cores).replace(/'/g,"")+'\',\''+String(tams).replace(/'/g,"")+'\')">🛒 ADICIONAR</button>';
    html=html.replace(/<button onclick="addCarrinho[^<]*<\/button>/, btnNovo);
    return html;
  }
  return _cardOriginal(o,destaque);
};

// 6. Confirmar Pedido Express - liga com o pau a abanar
function confirmarPedidoExpress(){
  var metodo=document.getElementById('metodoPag') ? document.getElementById('metodoPag').value : '';
  if(!metodo){
    // Se o checkout clicado foi TPA / Express, mete no select
    var sel=document.querySelector('.pag-opt.selec b');
    if(sel && sel.innerText.indexOf('TPA')>=0) metodo='TPA';
    else if(sel && sel.innerText.indexOf('Express')>=0) metodo='Multicaixa Express';
    else if(sel && sel.innerText.indexOf('Transfer')>=0) metodo='Transferência via IBAN';
    else if(sel && sel.innerText.indexOf('Unitel')>=0) metodo='Unitel Money';
    var s=document.getElementById('metodoPag'); if(s) s.value=metodo;
  }
  return confirmarPedido();
}
function salvarProdutoV20(){
  window._coresTemp=document.getElementById('prodCores') ? document.getElementById('prodCores').value : '';
  window._tamanhosTemp=document.getElementById('prodTamanhos') ? document.getElementById('prodTamanhos').value : '';
  return salvarProduto();
}
function mostrarProcessamento(){
  var m=document.getElementById('procModal');
  if(!m){ confirmarPedidoExpress(); return; }
  m.style.display='flex';
  var barra=document.getElementById('procBarra');
  var titulo=document.getElementById('procTitulo');
  var texto=document.getElementById('procTexto');
  var pau=document.getElementById('procPau');
  if(pau) pau.innerText='🪵';
  barra.style.width='5%'; titulo.innerText='A processar...'; texto.innerText='Aguarda, o pau está a abanar...';
  setTimeout(function(){ barra.style.width='45%'; titulo.innerText='A verificar pagamento...'; }, 900);
  setTimeout(function(){ barra.style.width='75%'; titulo.innerText='A criar pedido...'; }, 1900);
  setTimeout(function(){
    barra.style.width='100%'; titulo.innerText='✅ Pedido criado!'; if(pau) pau.innerText='✅';
    setTimeout(function(){ m.style.display='none'; confirmarPedidoExpress(); }, 1100);
  }, 2900);
}
#telaCarregamento{pointer-events:none}