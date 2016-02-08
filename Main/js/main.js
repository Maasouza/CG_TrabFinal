//Carregando a dependencia three-world
var Mundo = require('three-world')
//carregando modulo three
var THREE = require('three')

//carregando modulos do mapa e da nave
var Nave = require('./nave')
var Mapa = require('./mapa')

//função de update de frame
function render() {
  view.position.z-=1;
  mapa.atualizarZ(view.position.z)
}

//Iniciando o mundo
Mundo.init({ renderCallback: render,clearColor: 0x0000022,antialias:true}) //definindo a funçao de update e a cor de fundo do mundo

//criando um mapa
var mapa = new Mapa('images/1.jpg')

//definindo uma camera
var view  = Mundo.getCamera()

//criando nova nave
var nave = new Nave(view)

//efeito de nuvem para suavizar o fundo
Mundo.getScene().fog = new THREE.FogExp2(0x0000022, 0.00175)


//adicionando objetos ao mundo
Mundo.add(view)
Mundo.add(mapa.forma)


//----------//
Mundo.start()
//---------//
