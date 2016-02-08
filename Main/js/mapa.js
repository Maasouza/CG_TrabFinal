var THREE = require('three')



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

  this.showForma = function() {
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

module.exports = Mapa
