//---------------------------------Inimigo-------------------------------
var Inimigo = function() {

  var inimigo = new THREE.Object3D()
  var objmtlLoad = new THREE.OBJMTLLoader(manager);
  self=this
  inimigo.loaded = false
  //velocidade de translação
  inimigo.velocity = 0.7
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
      inimigo.position.set(-(diametro/2) + Math.random() * diametro,-(diametro/2) + Math.random() * diametro, -1500 - Math.random() * 1500)
      inimigo.loaded = true
    },
    onProgress
  )

  this.atualizar = function(z) {
    //a cada frame atualizar a posição
    inimigo.position.z += inimigo.velocity

    //se o inimigo passar da nave reiniciar a posição
    if(inimigo.position.z > z) {
      inimigo.position.set(
        -(diametro/2) + Math.random() * diametro,
        -(diametro/2) + Math.random() * diametro,
        z - 1500 - Math.random() * 1500
      )
    }
  }

  this.getInimigo = function() {
    //retorna o objeto criado
    return inimigo
  }

  return this
}
