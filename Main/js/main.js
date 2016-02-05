//Carregando a dependencia three-world
var Mundo = require('three-world')
var THREE = require('three')

//função de update de frame
function render() {
}

//Iniciando o mundo
Mundo.init({ renderCallback: render })

var tunnel = new THREE.Mesh(
  new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),
  new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('images/0.jpg'),
    side: THREE.BackSide
  })
)
tunnel.rotation.x = -Math.PI/2
World.add(tunnel)

Mundo.start()
