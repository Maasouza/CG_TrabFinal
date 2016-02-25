var nave = null
var Nave = function(oSuper) {
  this.loaded = false
  var self = this, nave = null

  self.hitbox = new THREE.Box3()

  if(nave === null) {
    loader.load('obj/craft.obj', 'obj/craf.mtl', function(obj) {
      obj.scale.set(0.025, 0.025, 0.025)
      obj.rotation.set(0, Math.PI, 0)
      nave = obj
      spaceship.position.set(0, -25, -100)
      oSuper.add(nave)
      self.loaded = true
      self.hitbox.setFromObject(nave)
    })
  } else {
    oSuper.add(nave)
    self.loaded = true
  }

  this.update = function() {
    if(!nave) return
    this.hitbox.setFromObject(nave)
  }
}
