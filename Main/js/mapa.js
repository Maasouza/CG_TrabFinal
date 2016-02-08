var THREE = require('three')



var Mapa = function(texPath) {
  //criando pois somente é retornado um objeto
  var mapa = new THREE.Object3D()
  
  //criando um malha
  var forma = new THREE.Mesh(
    new THREE.CylinderGeometry(100, 100, 5000, 24, 24, true),//forma cilindrica
    new THREE.MeshBasicMaterial({//carregando a textura
      map: THREE.ImageUtils.loadTexture(texPath, null, function(textura) {
        textura.wrapS = textura.wrapT = THREE.RepeatWrapping
        textura.repeat.set(5, 10)
        textura.needsUpdate = true
      }),
      side: THREE.BackSide //textura aplicada internamente
    })
  )
  //rotacionando o cilindro para pos frontal a camera
  forma.rotation.x = -Math.PI/2
  mapa.add(forma)

  this.showForma = function() {
    return mapa
  }
  return this;
}

module.exports = Mapa
