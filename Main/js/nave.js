//criando o modulo da nave

var THREE = require('three')
// carregando o modulo de load de objetos 3D
var myLoader = require('./objmtlloader')

var nave = null

//definindo o modulo
var Nave = function(sObject){

  var objLoad = new THREE.OBJMTLLoader();

  //definir modelo como nao carregado
  this.loaded = false
  //caso nao tenha uma na
  if(nave == null){
      //carregando o modelo da nave
      objLoad.load(
        //local do objeto
        'obj/craft.obj',
        //local material
        'obj/craft.mtl',
        //quando carrega-los
        function(object){

          //nave 30% do tamanho original
          object.scale.set(0.3,0.3,0.3)
          object.rotation.set(0, Math.PI, 0)
          object.position.set(0, -25, -100)

          nave = object

          //ancorando a nave à um objeto
          sObject.add(nave)

          //definir nave como carregada
          this.loaded = true
        }
      )
    }
}

//exportando modulo
module.exports = Nave
