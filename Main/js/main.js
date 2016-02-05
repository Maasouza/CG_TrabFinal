//Carregando a dependencia three-world
var Mundo = require('three-world')
var THREE = require('three')

//função de update de frame
function render() {
}

//Iniciando o mundo
Mundo.init({ renderCallback: render })
//criando o mapa (buraco de minhoca)
//formato de cilindro
var wormhole = new THREE.Mesh(
  new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),
  new THREE.MeshBasicMaterial({
    //utilizando a textura na parte de dentro do cilindro
    map: THREE.ImageUtils.loadTexture('images/1.jpg'),
    side: THREE.BackSide
  })
)
//rotacionando o cilindro
wormhole.rotation.x = -Math.PI/2
Mundo.add(wormhole)

Mundo.start()
