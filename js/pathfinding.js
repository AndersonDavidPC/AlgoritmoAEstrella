var canvas;
var ctx;
var FPS = 50;

//Escenario
var columnas = 50;
var filas = 50;
var escenario;  //matriz del nivel

//Tiles
var anchoT;
var altoT;

const muro = '#3B2C39';
const tierra = '#8A557C';


//Ruta
var principio;
var fin;

var openSet = [];
var closedSet = [];

var camino = [];
var terminado = false;




//Crear array 2d
function creaArray2D(f,c){
  var obj = new Array(f);
  for(a=0; a<f; a++){
    obj[a] = new Array(c);
  }
  return obj;
}



function heuristica(a,b){
  var deltaX = Math.abs(a.x - b.x);
  var deltaY = Math.abs(a.y - b.y);


  return deltaX+deltaY;
}


function borraDelArray(array,elemento){
  for(i=array.length-1; i>=0; i--){
    if(array[i] == elemento){
      array.splice(i,1);
    }
  }
}





function Casilla(x,y){

  //Posición
  this.x = x;
  this.y = y;

  //Tipo (obstáculo=1, vacío=0)
  this.tipo = 0;

  var aleatorio = Math.floor(Math.random()*5);  // 0-4
  if(aleatorio == 1)
      this.tipo = 1;

  //Pesos
  this.f = 0;  //coste total (g+h)
  this.g = 0;  //pasos dados
  this.h = 0;  //heurística (estimación de lo que queda)

  this.vecinos = [];
  this.padre = null;


  //Calcular vecinos
  this.addVecinos = function(){
    if(this.x > 0)
      this.vecinos.push(escenario[this.y][this.x-1]);   //vecino izquierdo

    if(this.x < filas-1)
      this.vecinos.push(escenario[this.y][this.x+1]);   //vecino derecho

    if(this.y > 0)
      this.vecinos.push(escenario[this.y-1][this.x]);   //vecino de arriba

    if(this.y < columnas-1)
      this.vecinos.push(escenario[this.y+1][this.x]); //vecino de abajo
  }



  //Dibujar casillas
  this.dibuja = function(){
    var color;

    if(this.tipo == 0)
      color = tierra;

    if(this.tipo == 1)
      color = muro;

    //Dibujar el canvas
    ctx.fillStyle = color;
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }



  //Dibujar el OpenSet
  this.dibujaOS = function(){
    ctx.fillStyle = '#6BBD5F';
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);

  }

  //Dibujar el ClosedSet
  this.dibujaCS = function(){
    ctx.fillStyle = '#70342D';
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }


  //Dibujar el camino
  this.dibujaCamino = function(){
    ctx.fillStyle = '#FFC025';
    ctx.fillRect(this.x*anchoT,this.y*altoT,anchoT,altoT);
  }


}



function inicializa(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  //Calcular el tamaño de los tiles
  anchoT = parseInt(canvas.width/columnas);
  altoT = parseInt(canvas.height/filas);

  //Crear la matriz
  escenario = creaArray2D(filas,columnas);

  //Añadir los objetos en las casillas
  for(i=0;i<filas;i++){
    for(j=0;j<columnas;j++){
        escenario[i][j] = new Casilla(j,i)
    }
  }

  //Añadir los vecinos
  for(i=0;i<filas;i++){
    for(j=0;j<columnas;j++){
        escenario[i][j].addVecinos();
    }
  }

  //Crear origen y destino
  principio = escenario[Math.floor(Math.random()*columnas)][Math.floor(Math.random()*filas)];
  fin = escenario[Math.floor(Math.random()*columnas)][Math.floor(Math.random()*filas)];
  fin.tipo=0; //El final no puede ser muro
  //Inicializar el openSet
  openSet.push(principio);

  //Ejecutar en bucle el método main
  setInterval(function(){main();},1000/FPS);
}



function dibujaEscenario(){
  for(i=0;i<filas;i++){
    for(j=0;j<columnas;j++){
      if (escenario[i][j]==principio) {
        //Dibujar principio
      }else if (escenario[i][j]==fin) {
        //Dibujar final
      }else {
        escenario[i][j].dibuja();
      }
    }
  }
  //Dibujar el OpenSet
  for(i=0; i<openSet.length; i++){
    openSet[i].dibujaOS();
  }


  //Dibujar el ClosedSet
  for(i=0; i<closedSet.length; i++){
    closedSet[i].dibujaCS();
  }

  for(i=0; i<camino.length; i++){
    camino[i].dibujaCamino();
  }



}


function borraCanvas(){
  canvas.width = canvas.width;
  canvas.height = canvas.height;
}






function algoritmo(){

  //Seguir hasta llegar a la solución
  if(terminado!=true){

    //Seguir si hay OpenSet disponible
    if(openSet.length>0){
      var optimo = 0;  //índie o posición dentro del array openset del optimo

      //Evaluar que OpenSet tiene un menor coste / esfuerzo
      for(i=0; i<openSet.length; i++){
        if(openSet[i].f < openSet[optimo].f){
          optimo = i;
        }
      }

      //Analizar la casilla optima
      var actual = openSet[optimo];

      //Si se llega al final recordar el camino por medio de los padres
      if(actual === fin){

        var temporal = actual;
        camino.push(temporal);

        while(temporal.padre!=null){
          temporal = temporal.padre;
          camino.push(temporal);
        }


        console.log('camino encontrado');
        terminado = true;
      }

      //Si no se ha llegado, continuar
      else{
        borraDelArray(openSet,actual);
        closedSet.push(actual);

        var vecinos = actual.vecinos;

        //Recorrer los vecinos del optimo
        for(i=0; i<vecinos.length; i++){
          var vecino = vecinos[i];

          //Si el vecino está en openSet y no es un muro, continuar
          if(!closedSet.includes(vecino) && vecino.tipo!=1){
            var tempG = actual.g + 1;

            //si el vecino está en OpenSet y su peso es mayor
            if(openSet.includes(vecino)){
              if(tempG < vecino.g){
                vecino.g = tempG;     //camino más corto
              }
            }
            else{
              vecino.g = tempG;
              openSet.push(vecino);
            }

            //Actualizar valores
            vecino.h = heuristica(vecino,fin);
            vecino.f = vecino.g + vecino.h;

            //Guardar el padre
            vecino.padre = actual;

          }

        }


      }





    }

    else{
      console.log('No hay un camino posible');
      terminado = true;   //el algoritmo ha terminado
    }



  }

}



function main(){
  borraCanvas();
  algoritmo();
  dibujaEscenario();
}
