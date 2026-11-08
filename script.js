// ===== EMPIRE V3 - CORRIGIDO - ADMIN À VISTA =====

// 1. MOSTRAR BOTÃO ADMIN SEMPRE - NÃO ESCONDER MAIS
(function(){
  function mostrarAdmin(){
    var btns = document.querySelectorAll('button');
    btns.forEach(function(b){
      if(b.innerText.indexOf('Admin')>=0){
        b.style.display='block';
        b.style.visibility='visible';
      }
    });
    var a=document.getElementById('btnAdmin');
    if(a){ a.style.display='block'; a.style.visibility='visible'; }
    var escondido=document.getElementById('btnAdminEscondido');
    if(escondido){ escondido.style.display='block'; escondido.id='btnAdmin'; }
  }
  setTimeout(mostrarAdmin,500);
  setTimeout(mostrarAdmin,2000);
  setTimeout(mostrarAdmin,4000);

  // Continua a funcionar o truque: 5 toques no logo OU ?admin=1
  var toques=0, ultimo=0;
  document.addEventListener('click', function(e){
    var logo=document.getElementById('logoTexto')||document.getElementById('logo');
    if(logo && (logo.contains(e.target))){
      var agora=Date.now();
      if(agora-ultimo>800) toques=0;
      ultimo=agora; toques++;
      if(toques>=5){ toques=0; btnAdminClick(); }
    }
  });
  if(window.location.search.indexOf('admin=1')>=0){
    setTimeout(function(){ btnAdminClick(); },800);
  }
})();

// 2. LOGIN ADMIN CORRIGIDO - Qualquer conta Firebase pode ser Admin
// O login de Admin agora é separado do login de Cliente. Não confunde mais.
