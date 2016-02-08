//Carregando a dependencia three-world
var Mundo = require('three-world')
var THREE = require('three')
var Nave = require('./nave')
//função de update de frame
function render() {
  view.position.z-=1;
}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x000000,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

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

Mundo.getScene().fog = new THREE.FogExp2(0x0000022, 0.00125)

//rotacionando o cilindro para pos frontal a camera
wormhole.rotation.x = -Math.PI/2

//definindo uma camera
view  = Mundo.getCamera()

//criando nova nave
var nave = new Nave(view)

//adicionando objetos ao mundo
Mundo.add(view)
Mundo.add(wormhole)

Mundo.start()
