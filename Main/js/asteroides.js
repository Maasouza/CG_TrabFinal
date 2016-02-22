

var Asteroide = function() {
  var asteroide = new THREE.Object3D(), self = this

  // Velocidade de translação e rotação
  asteroide.velocity = Math.random()*0.5
  asteroide.vRotation = new THREE.Vector3(Math.random(), Math.random(), Math.random())

  this.hitbox = new THREE.Box3()

  loader.load(
    //modelo
    'obj/asteroide.obj',
    //quando carregar-los
    function(obj) {
      obj.traverse(function(child) {
        if(child instanceof THREE.Mesh) {
          child.material = astMaterial
        }
      }
    )
    //escalar o objeto para 6x o tamanho original
    obj.scale.set(6,6,6)

    asteroide.add(obj)
    //randomizar a posição do asteroide
    asteroide.position.set(-(diametro/2) + Math.random() * 100, -(diametro/2) + Math.random() * diametro, -1500 - Math.random() * 1500)
    //definir o hitbox
    self.hitbox.setFromObject(obj)
    self.loaded = true
  })

  //função para resetar o objeto como se fosse um novo
  this.recriarA = function(z) {
    asteroide.position.set(-(diametro/2) + Math.random() * 100, -(diametro/2) + Math.random() * diametro, -1500 - Math.random() * 1500)
  }

  //função para atualizar a posição do Asteroide
  this.atualizarA = function(z) {
    asteroide.position.z += asteroide.velocity
    asteroide.rotation.x += asteroide.vRotation.x * 0.02;
    asteroide.rotation.y += asteroide.vRotation.y * 0.02;
    asteroide.rotation.z += asteroide.vRotation.z * 0.02;
  //atualizar a hitbox
    if(asteroide.children.length > 0) this.hitbox.setFromObject(asteroide.children[0])

  //se o objeto passa da camera recria-lo
    if(asteroide.position.z > z) {
      this.recriar(z)
    }
  }
  //retorna o objeto
  this.getAsteroide = function() {
    return asteroide
  }
  return this
}
