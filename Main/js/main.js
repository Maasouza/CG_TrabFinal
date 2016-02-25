
//Carregando a dependencia three-world
var Mundo = require('three-world')
//carregando modulo three
var THREE = require('three')
// carregando o modulo de load de objetos 3D
var myLoader = require('./objmtlloader')
var myLoaderOBJ = require('./objloader')

//flag audio
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
  var pontos
  //funcionar dentro das outras funçoes
  var self=this
  //criando o hitbox
  self.hitbox = new THREE.Box3()
  nave = null
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
        'obj/craft.obj',
        //local material
        'obj/craft.mtl',
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

   this.hitbox = new THREE.Box3()

  //velocidade de translação
  asteroide.velocity = Math.random()*3.5 + 1.0
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
    asteroide.velocity = Math.random()*3.5 + 1
    asteroide.position.set(
      -(diametro/2) + Math.random() * diametro,
      -(diametro/2) + Math.random() * diametro,
      z - 1500 - Math.random() * 1500
    )
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
  inimigo.velocity = 4
  //
  this.hitbox = new THREE.Box3()

  objmtlLoad.load(
    //modelo
    "obj/inimigo.obj",
    //materialName
    "obj/inimigo.mtl",
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

var municao = new  THREE.MeshBasicMaterial({  //material do tiro
  color: 0xffff66
})

var Tiro = function(p){ //classe tiro, inicializada na posiÃ§Ã£o P0
  var objTiro = null

  this.objTiro  = new THREE.Mesh(
    new THREE.SphereGeometry(1,16,16), //geometria do tiro
    municao//material
  )

  this.hitbox = new THREE.Box3()

  this.objTiro.position.copy(p)

  this.getTiro = function(){
    return this.objTiro
  }

  this.atualizar = function(z){
    this.objTiro.position.z -=8
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


function render() {
  update()
}

//função de update de frame
var update = function(){
  view.position.z-=2;
  //atualizar a posição da nave(camera)
  mapa.atualizarZ(view.position.z)
  //atualizar a posiçao do hitbox da nave
  jogador.atualizar()

  //atualizar a posição dos asteroides
  for(var i=0;i<N_OBJS;i++) {
    if(!asteroides[i].loaded)continue
    asteroides[i].atualizar(view.position.z)
    if(jogador.loaded && jogador.hitbox.isIntersectionBox(asteroides[i].hitbox)){
      asteroides[i].resetar(view.position.z)
    }
  }
  naveI.atualizar(view.position.z)
  if(jogador.loaded && jogador.hitbox.isIntersectionBox(naveI.hitbox)){
    naveI.resetar(view.position.z)
    jogador.pontos+=10
  }

  for(var i=0; i<tiros.length; i++){ //removendo o tiro
    if(!tiros[i].atualizar(view.position.z)){
      Mundo.getScene().remove(tiros[i].getTiro())
      tiros.splice(i, 1)
    }
  }

}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x0000022,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

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
var origem = new THREE.Vector2(0,0)
var navePos = new THREE.Vector2(0,0)
window.addEventListener('keydown',
 function(e) {

    if(e.keyCode == 37 ) {
      navePos.x=view.position.x-23//compensar a largura da nave
      navePos.y=view.position.y-25
      if(origem.distanceTo(navePos)<100){
       view.position.x -= 2
      }
    }else{
      if(e.keyCode == 39 ){
        navePos.x=view.position.x+23
        navePos.y=view.position.y-25
        if(origem.distanceTo(navePos)<100){
         view.position.x += 2
        }
      }
    }

    if(e.keyCode == 38 ) {
      navePos.x=view.position.x
      navePos.y=view.position.y-20
      if(origem.distanceTo(navePos)<100){
       view.position.y += 2
      }
    }else{
      if(e.keyCode == 40){
        navePos.x=view.position.x
        navePos.y=view.position.y-30
        if(origem.distanceTo(navePos)<100){
         view.position.y -= 2
        }

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
      break;
  }
})
