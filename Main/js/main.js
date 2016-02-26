
//Carregando a dependencia three-world
var Mundo = require('three-world')
//carregando modulo three
var THREE = require('three')
// carregando o modulo de load de objetos 3D
var myLoader = require('./objmtlloader')
var myLoaderOBJ = require('./objloader')

//funçoes e variaves
var somTiro = new Audio("audio/tiro.mp3")
var somTiro2 = new Audio("audio/tiro.mp3")//caso o deltaT entre os tiros seja pequeno
somTiro.volume = 0.5
somTiro2.volume = 0.5

//meteoro batendo na nave
var somMeteoro = new Audio("audio/explosao.mp3")
somMeteoro.volume = 0.5

//capturando uma nave
var captura = new Audio("audio/item.mp3")
captura.volume = 0.5

//destruindo uma nave ou meteoro
var destruir = new Audio("audio/asteroide.mp3")
var destruir2 = new Audio("audio/asteroide.mp3")//mesmo motivo do somTiro2
destruir2.volume =0.5
destruir.volume = 0.5

//audio menu gameover
var gameover = new Audio("audio/gameover.mp3")
gameover.volume = 0.5
gameover.loop = true

//audio 0 vidas
var nolife = new Audio("audio/navelife.mp3")
nolife.volume = 0.5

//flag audio musica
var on = true

//Numero de asteroides e inimigos
var N_OBJS = 11
var diametro = 100

// material asteroide
var astMaterial = new THREE.MeshLambertMaterial({
  map: THREE.ImageUtils.loadTexture('images/lua.png')
})

//gerenciador de carregamento
var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded,total);
    var porcento = (loaded/total)*100
    //atualiza a % da tela de carregamento
    document.getElementById("loading").innerHTML = "Carregando "+item+" ... "+Math.round(porcento, 2)+"%";
};
//quando todos os modelos tiverem carregados
manager.onLoad = function(){
  //retirar a tela de carregamento e iniciar o jogo
  document.getElementById("backgroundAudio").play();
  document.getElementById("loadDiv").style.display='none';
  document.getElementById("infobar").style.display='block';

  Mundo.start()
}

var onProgress = function ( xhr ) {
  if ( xhr.lengthComputable ) {
    var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};
//---------------------------------Mapa---------------------------------------
var Mapa = function(texPath) {
  //criando pois somente é retornado um objeto
  var mapa = new THREE.Object3D()
  var formas = []

  //criando um malha
  formas.push(new THREE.Mesh(
    new THREE.CylinderGeometry(diametro, diametro, 5000, 24, 24, true),//forma cilindrica
    new THREE.MeshBasicMaterial({//carregando a textura
      map: THREE.ImageUtils.loadTexture(texPath, null, function(textura) {
        textura.wrapS = textura.wrapT = THREE.RepeatWrapping
        textura.repeat.set(5, 10)
        textura.needsUpdate = true
      }),
      side: THREE.BackSide //textura aplicada internamente
    })
  ))
  //rotacionando o cilindro para pos frontal a camera
  formas[0].rotation.x = -Math.PI/2
  formas.push(formas[0].clone())
  formas[1].position.z=-5000

  mapa.add(formas[0])
  mapa.add(formas[1])

  this.getMapa = function() {
    return mapa
  }
  this.atualizarZ = function(z) {
      for(var i=0; i<2; i++) {
        if(z < formas[i].position.z - 2500) {
          formas[i].position.z -= 10000
          break
        }
      }
    }


  return this;
}

//---------------------------------Nave----------------------------------------

var nave = null
var Nave = function(sObject){
  //
  var pontos,vida
  //funcionar dentro das outras funçoes
  var self=this
  //criando o hitbox
  self.hitbox = new THREE.Box3()
  nave = null
  this.vida = 3
  this.pontos = 0
  var loaded = false
  //instanciando o loader
  var objmtlLoad = new THREE.OBJMTLLoader(manager);
  //definir modelo como nao carregado
  this.loaded = false
  //caso nao tenha uma nave
  if(nave === null){
      //carregando o modelo da nave
      objmtlLoad.load(
        //local do objeto
        'obj/thenave.obj',
        //local material
        'obj/thenave.mtl',
        //quando carrega-los
        function(object){
          //nave 30% do tamanho original
          object.scale.set(0.025,0.025,0.025)
          object.rotation.set(0, Math.PI, 0)
          nave = object
          nave.position.set(0, -25, -80)
          //ancorando a nave à um objeto
          sObject.add(nave)
          //criar posiçao posição do hitbox
          self.hitbox.setFromObject(object)//copia a posição e as dimensoes do objeto
          //definir nave como carregada
          self.loaded = true
        },
        onProgress
      )
    }else{
      sObject.add(nave)
      self.loaded = true
    }
    //funçao para atualizar a posição do hitbox
    this.atualizar = function(){
        if(nave!=null){
          this.hitbox.setFromObject(nave)//copia a posição e as dimensoes do objeto
        }
    }

}

//---------------------------------Asteroide-----------------------------------

var Asteroide = function() {
  var loaded = false
  var asteroide = new THREE.Object3D()
  var objmtlLoad = new THREE.OBJLoader(manager);
  var self=this;
  var pontosDados //pontos recebidos por destruir entre [10,20]
  this.hitbox = new THREE.Box3()
  this.pontosDados = Math.floor(10 + Math.random()*10)
  //velocidade de translação
  asteroide.velocity = Math.random()*3.5 + 2.0
  //velocidade de rotação
  asteroide.vRotation = new THREE.Vector3(Math.random(), Math.random(), Math.random())

  objmtlLoad.load(
    //modelo
    "obj/asteroide.obj",
    //quando carregar-los
    function(object){

			object.traverse( function ( child ) {
			   if(child instanceof THREE.Mesh ) {
			      child.material = astMaterial;
			   }
			  }
      )
      object.scale.set(6,6,6)
      asteroide.add(object)
      //randomizando a posiçao do asteroide dentro do cilindro
      asteroide.position.set(-(diametro/2) + Math.random() * 100, -(diametro/2) + Math.random() * diametro, -1500 - Math.random() * 1500)
      self.loaded = true

    },
    onProgress
  )

  this.resetar = function(z){
    asteroide.velocity = Math.random()*3.5 + 2
    asteroide.position.set(
      -(diametro/2) + Math.random() * diametro,
      -(diametro/2) + Math.random() * diametro,
      z - 1500 - Math.random() * 1500
    )
    this.pontosDados =Math.floor( 10 + Math.random()*10 )

  }

  this.atualizar = function(z) {
    //a cada frame atualizar a posição e a rotação
    asteroide.position.z += asteroide.velocity
    asteroide.rotation.x += asteroide.vRotation.x * 0.05;
    asteroide.rotation.y += asteroide.vRotation.y * 0.05;
    asteroide.rotation.z += asteroide.vRotation.z * 0.05;
    //se existir um
    if(asteroide.children.length > 0) this.hitbox.setFromObject(asteroide.children[0])

    //se o asteroide passar da nave reiniciar a posição
    if(asteroide.position.z > z) {
      this.resetar(z)
    }
  }

  this.getAsteroide = function() {
    //retorna o objeto criado
    return asteroide
  }
  return this
}

//-------------------------------inimigos-------------------------------

var Inimigo = function() {
  var carregado = false
  var inimigo = new THREE.Object3D()
  var objmtlLoad = new THREE.OBJMTLLoader(manager);
  var self=this
  this.loaded = false
  //velocidade de translação
  inimigo.velocity = 5
  //
  this.hitbox = new THREE.Box3()

  objmtlLoad.load(
    //modelo
    "obj/tielow.obj",
    //materialName
    "obj/tielow.mtl",
    //quando carregar-los
    function(object){
      object.scale.set(0.15,0.15,0.15)
      object.rotation.set( Math.PI, Math.PI, 0)
      inimigo.add(object)
      inimigo.position.set(-(diametro/2) + Math.random() * diametro,-(diametro/2)
        + Math.random() * diametro, -1500 - Math.random() * 1500)
      self.loaded = true

    },
    onProgress
  )
  this.resetar = function(z){
    inimigo.position.set(
      -(diametro/2) + Math.random() * diametro,
      -(diametro/2) + Math.random() * diametro,
      z - 1500 - Math.random() * 1500
    )
  }

  this.atualizar = function(z) {
    //a cada frame atualizar a posição
    inimigo.position.z += inimigo.velocity
    if(inimigo.children.length > 0) this.hitbox.setFromObject(inimigo.children[0])

    //se o inimigo passar da nave reiniciar a posição
    if(inimigo.position.z > z) {
      this.resetar(z)
    }
  }

  this.getInimigo = function() {
    //retorna o objeto criado
    return inimigo
  }

  return this
}

//--------------------------Tiro-----------------------------------------

var municao = new  THREE.MeshPhongMaterial({  //material do tiro
  color: 0xf2ea63,
  emissive: 0xebeb6c
})

var Tiro = function(p){ //classe tiro, inicializada na posiÃ§Ã£o P0
  var objTiro = null

  this.objTiro  = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35,0.35,1.5), //geometria do tiro
    municao//material
  )

  this.hitbox = new THREE.Box3()

  this.objTiro.position.copy(p)

  this.getTiro = function(){
    return this.objTiro
  }

  this.atualizar = function(z){
    this.objTiro.position.z -=10
    this.hitbox.setFromObject(this.objTiro)

    if(Math.abs(this.objTiro.position.z - z) > 1000){
      return false
      delete this.objTiro
    }
    return true
  }

  return this
}

//-----------------------------------------------------------------------

//função de update de frame
function render() {
  view.position.z-=2;
  //atualizar a posição da nave(camera)
  mapa.atualizarZ(view.position.z)
  //atualizar a posiçao do hitbox da nave
  jogador.atualizar()

  for(var i=0; i<tiros.length; i++){ //removendo o tiro
    if(!tiros[i].atualizar(view.position.z)){
      Mundo.getScene().remove(tiros[i].getTiro())
      tiros.splice(i, 1)
    }
  }

  //atualizar a posição dos asteroides
  for(var i=0;i<N_OBJS;i++) {
    if(!asteroides[i].loaded)continue
    asteroides[i].atualizar(view.position.z)
    if(jogador.loaded && jogador.hitbox.isIntersectionBox(asteroides[i].hitbox)){
      asteroides[i].resetar(view.position.z)
      if(jogador.vida>1) {
        somMeteoro.play()
      }else{
        nolife.play()
      }
      switch (jogador.vida) {
        case 3:{
                document.getElementById('vida').textContent = "♥ ♥"
                break;
               }
        case 2:{
                document.getElementById('vida').textContent = "♥"
                break;
               }
        default:break;

      }
      jogador.vida-=1
    }
    for(var j=0; j<tiros.length; j++) {
        if(asteroides[i].hitbox.isIntersectionBox(tiros[j].hitbox)) {
          if(destruir.paused){
            destruir.play()
          }else{
            destruir2.play()
          }
          jogador.pontos+=asteroides[i].pontosDados
          document.getElementById('pontos').textContent = jogador.pontos
          asteroides[i].resetar(view.position.z)
          Mundo.getScene().remove(tiros[j].getTiro())
          tiros.splice(j, 1)
          break
        }
      }
  }

  naveI.atualizar(view.position.z)
  if(jogador.loaded && jogador.hitbox.isIntersectionBox(naveI.hitbox)){
    captura.play()
    naveI.resetar(view.position.z)
    jogador.pontos+=25
    document.getElementById('pontos').textContent = jogador.pontos
  }

  for(var j=0; j<tiros.length; j++) {
      if(naveI.hitbox.isIntersectionBox(tiros[j].hitbox)) {
        if(destruir.paused){
          destruir.play()
        }else{
          destruir2.play()
        }         naveI.resetar(view.position.z)
        Mundo.getScene().remove(tiros[j].getTiro())
        tiros.splice(j, 1)
        if(jogador.pontos>=10){
          jogador.pontos-=10
          document.getElementById('pontos').textContent = jogador.pontos
        }
        break
      }
    }

    mira.geometry.vertices[0] = view.position.clone().add(new THREE.Vector3(0,-25,-80))
    mira.geometry.vertices[1] = view.position.clone().add(new THREE.Vector3(0,-25,-9999999))
    mira.geometry.verticesNeedUpdate = true;
    console.log("mira p0 "+mira.geometry.vertices[0].z+" p1 "+mira.geometry.vertices[1].z)
    console.log("nave "+view.position.z)

    if(jogador.vida==0){
      gameoverState()
    }

}

var gameoverState = function(){
  Mundo.pause();
  document.getElementById("backgroundAudio").pause()
  gameover.play()
  document.getElementById("infobar").style.display='none';
  document.getElementById("backgroundMenu").style.display="block";

}

var resetarMundo = function(){
  //resetando a posição do asteroides,nave e removendo os tiros
  for(var i = 0;i<asteroides.length;i++){
      asteroides[i].resetar()
  }
  naveI.resetar()
  for(var i=0; i<tiros.length; i++){ //removendo o tiro
          Mundo.getScene().remove(tiros[i].getTiro())
      tiros.splice(i, 1)
  }
  gameover.pause();

  //resetar dados da infobar
  document.getElementById('vida').textContent = "♥ ♥ ♥"
  document.getElementById('pontos').textContent = 0

  //resetando a vida e os pontos do jogador
  jogador.vida=3
  jogador.pontos=0
  view.position.sub(view.position)
  Mundo.resume()
}

//teste mira
var mtMira = new THREE.LineBasicMaterial({
  color:0xFF1100,
  transparent:true,
  opacity:0.6
})

var geoMira = new THREE.Geometry()
geoMira.vertices.push(
  new THREE.Vector3( 0, -25, 0 ),
	new THREE.Vector3( 0, -25,-1000 )
)



var mira = new THREE.Line(geoMira,mtMira)

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x0000022,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

Mundo.add(mira)
//criando um mapa
var mapa = new Mapa('images/1.jpg')

//definindo uma camera
var view  = Mundo.getCamera()

//criando nova nave
var jogador = new Nave(view)

//criando o vetor de tiros
var tiros =[]

//criando vetor para armazenar os asteroides
var asteroides = []
for(var i = 0;i<N_OBJS;i++){
  asteroides.push(new Asteroide())
  Mundo.add(asteroides[i].getAsteroide())
}

var naveI = new Inimigo()
Mundo.add(naveI.getInimigo())

//efeito de nuvem para suavizar o fundo
Mundo.getScene().fog = new THREE.FogExp2(0x0000022, 0.00175)

//adicionando objetos ao mundo
Mundo.add(view)
Mundo.add(mapa.getMapa())


//---------------------------------eventos------------------------------------
window.addEventListener('keydown',
 function(e) {

    if(e.keyCode == 37 ) {
       view.position.x -= 2
    }else{
      if(e.keyCode == 39 ){
         view.position.x += 2
        }
      }


    if(e.keyCode == 38 ) {
       view.position.y += 2
    }else{
      if(e.keyCode == 40){
         view.position.y -= 2
      }
    }

    if(e.keyCode == 77){//m
      var audio = document.getElementById("backgroundAudio");
      if(on){
        audio.pause();
        on=false
      }else{
        audio.play()
        on=true
      }
    }
}
)
  

  window.addEventListener('keyup', function(e){ //para funcionar sÃ³ quando soltar o espaÃ§o
  switch (e.keyCode) {
    case 32: //espaÃ§o
      var posicaoTiro = new THREE.Vector3(0,0,0)
      posicaoTiro = view.position.clone()
      posicaoTiro.sub(new THREE.Vector3(0,25,80)) //subtraindo a posiÃ§Ã£o da nave em relaÃ§Ã£o a cÃ¢mera
      var tiro = new Tiro(posicaoTiro)
      tiros.push(tiro)
      Mundo.add(tiro.getTiro())
      if(somTiro.paused){
        somTiro.play()
      }else {
        somTiro2.play()
      }
      break;
  }
})
