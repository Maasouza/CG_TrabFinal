
//Carregando a dependencia three-world
var Mundo = require('three-world')
//carregando modulo three
var THREE = require('three')
// carregando o modulo de load de objetos 3D
var myLoader = require('./objmtlloader')
var myLoaderOBJ = require('./objloader')


//Numero de asteroides e inimigos
var N_OBJS = 5
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
  self=this
  var loaded = false
  //instanciando o loader
  var objmtlLoad = new THREE.OBJMTLLoader(manager);
  //definir modelo como nao carregado
  this.loaded = false
  //caso nao tenha uma nave
  if(nave == null){
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
          object.position.set(0, -25, -80)
          nave = object
          //ancorando a nave à um objeto
          sObject.add(nave)
          //definir nave como carregada
          self.loaded = true
        },
        onProgress
      )
    }
}

//---------------------------------Asteroide-----------------------------------

var Asteroide = function() {
  var loaded = false
  var asteroide = new THREE.Object3D()
  var objmtlLoad = new THREE.OBJLoader(manager);
  var self=this;
  //velocidade de translação
  asteroide.velocity = Math.random()*0.5
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
      asteroide.position.set(-(diametro/2) + Math.random() * 100, -(diametro/2) + Math.random() * diametro, -1500 - Math.random() * 1500)
      self.loaded = true
    },
    onProgress
  )

  this.resetar = function(z){
    asteroide.velocity = Math.random()*0.5
    asteroide.position.set(
      -(diametro/2) + Math.random() * diametro,
      -(diametro/2) + Math.random() * diametro,
      z - 1500 - Math.random() * 1500
    )
  }

  this.atualizar = function(z) {
    //a cada frame atualizar a posição e a rotação
    asteroide.position.z += asteroide.velocity
    asteroide.rotation.x += asteroide.vRotation.x * 0.02;
    asteroide.rotation.y += asteroide.vRotation.y * 0.02;
    asteroide.rotation.z += asteroide.vRotation.z * 0.02;

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
  self=this
  this.carregado = false
  //velocidade de translação
  inimigo.velocity = 0.5

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
      self.carregado = true
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


//-----------------------------------------------------------------------


//função de update de frame
function render() {
  view.position.z-=1;
  //atualizar a posição da nave(camera)
  mapa.atualizarZ(view.position.z)
  //atualizar a posição dos asteroides

  for(var i=0;i<N_OBJS;i++) {
    asteroides[i].atualizar(view.position.z)
    naveI.atualizar(view.position.z)
  }


}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x0000022,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

//criando um mapa
var mapa = new Mapa('images/1.jpg')

//definindo uma camera
var view  = Mundo.getCamera()

//criando nova nave
var nave = new Nave(view)

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


//----------//
// if(itensCarregados==15){
//   Mundo.start()
// }
//---------//
