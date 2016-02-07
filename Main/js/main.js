//Carregando a dependencia three-world
var myLoader = require('./objmtlloader')
var Mundo = require('three-world')
var THREE = require('three')
//função de update de frame
function render() {
}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x000022}) //definindo a funçao de update e a cor de fundo do mundo

//criando o mapa (buraco de minhoca)
//formato de cilindro
var wormhole = new THREE.Mesh(
  new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),
  new THREE.MeshBasicMaterial({
    //utilizando a textura na parte de dentro do cilindro
    map: THREE.ImageUtils.loadTexture('images/1.jpg',null,function(textura){
      textura.wrapS = textura.wrapT = THREE.RepeatWrapping
      textura.repeat.set(5,10)
      textura.needsUpdate = true //textura é atualizada dependendo da posição da nava
    }),
    side: THREE.BackSide
  })
)

//Adicionando nuvem a cena
Mundo.getScene().fog = THREE.FogExp2(0x000022,0.0125)

//rotacionando o cilindro para pos frontal a camera
wormhole.rotation.x = -Math.PI/2

var objLoad = new THREE.OBJMTLLoader();

objLoad.load(
  //objeto
  'obj/craft.obj',
  //material
  'obj/craft.obj',
  //quando carrega-los
  function(object){
    Mundo.add(object)
  }
)


Mundo.add(wormhole)

Mundo.start()
