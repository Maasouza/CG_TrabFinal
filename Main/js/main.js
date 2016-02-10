//Carregando a dependencia three-world
var Mundo = require('three-world')
//carregando modulo three
var THREE = require('three')
// carregando o modulo de load de objetos 3D
var myLoader = require('./objmtlloader')


//Numero de asteroides
var N_AST = 5

//---------------------------------Mapa---------------------------------------
var Mapa = function(texPath) {
  //criando pois somente é retornado um objeto
  var mapa = new THREE.Object3D()
  var formas = []

  //criando um malha
  formas.push(new THREE.Mesh(
    new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),//forma cilindrica
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
  //instanciando o loader
  var objmtlLoad = new THREE.OBJMTLLoader();
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
          object.scale.set(0.1,0.1,0.1)
          object.rotation.set(0, Math.PI, 0)
          object.position.set(0, -25, -100)
          nave = object
          //ancorando a nave à um objeto
          sObject.add(nave)
          //definir nave como carregada
          this.loaded = true
        }
      )
    }
}

//---------------------------------Asteroide-----------------------------------

var Asteroide = function() {
  var asteroide = new THREE.Object3D()
  var objmtlLoad = new THREE.OBJMTLLoader();
  this.loaded = false
  //velocidade de translação
  asteroide.velocity = Math.random() * 2 + 1
  //velocidade de rotação
  asteroide.vRotation = new THREE.Vector3(Math.random(), Math.random(), Math.random())

  objmtlLoad.load(
    //modelo
    "obj/asteroide.obj",
    //materialName
    "obj/asteroide.mtl",
    //quando carregar-los
    function(object){
      object.scale.set(0.51,0.51,0.51)
      asteroide.add(object)

      asteroide.position.set(-50 + Math.random() * 100, -50 + Math.random() * 100, -1500 - Math.random() * 1500)
      self.loaded = true
    }
  )

  this.atualizar = function(z) {
    //a cada frame atualizar a posição e a rotação
    asteroide.position.z += asteroide.velocity
    asteroide.rotation.x += asteroide.vRotation.x * 0.02;
    asteroide.rotation.y += asteroide.vRotation.y * 0.02;
    asteroide.rotation.z += asteroide.vRotation.z * 0.02;

    //se o asteroide passar da nave reiniciar a posição
    if(asteroide.position.z > z) {
      asteroide.velocity = Math.random() * 2 + 2
      asteroide.position.set(
        -50 + Math.random() * 100,
        -50 + Math.random() * 100,
        z - 1500 - Math.random() * 1500
      )
    }
  }

  this.getAsteroide = function() {
    return asteroide
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
  for(var i=0;i<N_AST;i++) asteroides[i].atualizar(view.position.z)


}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x0000022,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

//criando vetor para armazenar os asteroides
var asteroides = []
for(var i = 0;i<N_AST;i++){
  asteroides.push(new Asteroide())
  Mundo.add(asteroides[i].getAsteroide())
}
//criando um mapa
var mapa = new Mapa('images/1.jpg')

//definindo uma camera
var view  = Mundo.getCamera()

//criando nova nave
var nave = new Nave(view)


//efeito de nuvem para suavizar o fundo
Mundo.getScene().fog = new THREE.FogExp2(0x0000022, 0.00175)

//adicionando objetos ao mundo
Mundo.add(view)
Mundo.add(mapa.getMapa())


//----------//
Mundo.start()
//---------//
