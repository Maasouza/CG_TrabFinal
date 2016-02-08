//Carregando a dependencia three-world
var myLoader = require('./objmtlloader')
var Mundo = require('three-world')
var THREE = require('three')
//função de update de frame
function render() {
  view.position.z-=1;
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

//carregar modelo 3d formato .obj e material formato .mtl
var objLoad = new THREE.OBJMTLLoader();

//criando a nave
var spacership = null

//definindo uma camera
view    = Mundo.getCamera()

//carregando o modelo da nave
objLoad.load(
  //local do objeto
  'obj/craft.obj',
  //local material
  'obj/craft.mtl',
  //quando carrega-los
  function(object){
    //nave 3x tamanho original
    object.scale.set(3,3,3)
    object.rotation.set(0, Math.PI, 0)
    object.position.set(0, -25, 0)

    spaceship = object
    view.add(spaceship)
    Mundo.add(view)
  }
)


Mundo.add(wormhole)

Mundo.start()
