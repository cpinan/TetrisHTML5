// Request Animation Frame
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var WIDTH = 480, HEIGHT = 480;

var canvas = jQuery("#gameCanvas")[0];
var context = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
var time, delta;
var FPS = 1 / 12;

// Game variables
var TILE_SIZE = 24;
var unit;
var count_timer, TIMER_TIME = 3.0;

var fieldArray;
var tetrominoesArray;
var tetromino;
var nextTetromino;
var tRow, tCol;

var gameOver;

var colors = ["#444444","#555555"];

/*************************************************************/
/*************************************************************/

var TetrisObject = function()
{
	this.color = "#000000";
	this.figure = [];
	this.rotation = 0;
	this.x = 0;
	this.y = 0;

	this.draw = function()
	{
		if(this.figure.length > 0)
		{
			for(var row = 0; row < this.figure[this.rotation].length; row++)
			{
				for(var col = 0; col < this.figure[this.rotation][row].length; col++)
				{		
					var number = this.figure[this.rotation][row][col];
					if(number == 1)
					{
						context.save();

						context.fillStyle = this.color;
						context.fillRect((this.x + col) * TILE_SIZE, (this.y + row) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

						context.strokeStyle = "#000000";
						context.lineWidth = 0;
						context.strokeRect((this.x + col) * TILE_SIZE, (this.y + row) * TILE_SIZE, TILE_SIZE, TILE_SIZE);

						context.restore();

					}
				}
			}
		}
	};	

	this.canFit = function(j, i, rot)
	{
		if(this.figure.length > 0)
		{
			for(var row = 0; row < this.figure[rot].length; row++)
			{
				for(var col = 0; col < this.figure[rot][row].length; col++)
				{		
					var number = this.figure[rot][row][col];
					if(number == 1)
					{

						if(col + i < 0)
							return false;

						if(col + i > 9)
							return false;

						if(row + j > 19)
							return false;

						if(fieldArray[row + j] == undefined)
							console.log("Undefined Row");

						if(fieldArray[row + j][col + i] == undefined)
							console.log("Undefined row ; col");

						if (fieldArray[row + j][col + i].closed == 1) 
							return false;

					}
				}
			}
			return true;
		}
		return false;
	};

};

var Sprite = function()
{
	this.graphics = 
	{
		x: 0,
		y: 0,
		strokeColor: "#000000",
		strokeWidth: 0,
		rectColor: "#000000",
		prevColor: "#000000"
	};

	this.closed = 0;

	this.draw = function()
	{
		context.save();

		context.fillStyle = this.graphics.rectColor;
		context.fillRect(this.graphics.x * TILE_SIZE, this.graphics.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

		context.strokeStyle = this.graphics.strokeColor;
		context.lineWidth = this.graphics.strokeWidth;
		context.strokeRect(this.graphics.x * TILE_SIZE, this.graphics.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

		context.restore();
	};
};

/*************************************************************/
/*************************************************************/

function generarCampoDeJuego()
{
	for(var row = 0; row < 20; row++)
	{
		fieldArray[row] = new Array();
		for(var col = 0; col < 10; col++)
		{			
			var fieldSprite = new Sprite();
			fieldSprite.graphics.strokeWidth = 0;
			fieldSprite.graphics.strokeColor = "#000000";
			fieldSprite.graphics.rectColor = colors[col % 2 + row % 2 % 2];
			fieldSprite.graphics.prevColor = fieldSprite.graphics.rectColor;
			fieldSprite.graphics.x = col;
			fieldSprite.graphics.y = row;
			fieldSprite.closed = 0;
			fieldArray[row][col] = fieldSprite;
		}
	}
}

function initTetrominoes()
{
	var tetris, color, figure;

	// Figura I
	color = "#00FFFF";
	figure = [
				[
					[0,0,0,0],
					[1,1,1,1],
					[0,0,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[0,1,0,0],
					[0,1,0,0],
					[0,1,0,0]
				]
			];

	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);

	// Figura T
	color = "#AA00FF";
	figure = [
				[
					[0,0,0,0],
					[1,1,1,0],
					[0,1,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[1,1,0,0],
					[0,1,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[1,1,1,0],
					[0,0,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[0,1,1,0],
					[0,1,0,0],
					[0,0,0,0]
				]
			];

	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);

	// Figura L
	color = "#FFA500";
	figure = [
				[
					[0,0,0,0],
					[1,1,1,0],
					[1,0,0,0],
					[0,0,0,0]
				],
				[
					[1,1,0,0],
					[0,1,0,0],
					[0,1,0,0],
					[0,0,0,0]
				],
				[
					[0,0,1,0],
					[1,1,1,0],
					[0,0,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[0,1,0,0],
					[0,1,1,0],
					[0,0,0,0]
				]
			];
	
	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);	

	// Figura J
	color = "#0000FF";
	figure = [
				[
					[1,0,0,0],
					[1,1,1,0],
					[0,0,0,0],
					[0,0,0,0]
				],
				[
					[0,1,1,0],
					[0,1,0,0],
					[0,1,0,0],
					[0,0,0,0]
				],
				[
					[0,0,0,0],
					[1,1,1,0],
					[0,0,1,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[0,1,0,0],
					[1,1,0,0],
					[0,0,0,0]
				]
			];
	
	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);	

	// Figura Z
	color = "#FF0000";
	figure = [
				[
					[0,0,0,0],
					[1,1,0,0],
					[0,1,1,0],
					[0,0,0,0]
				],
				[
					[0,0,1,0],
					[0,1,1,0],
					[0,1,0,0],
					[0,0,0,0]
				]
			];
	
	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);

	// Figura S
	color = "#00FF00";
	figure = [
				[
					[0,0,0,0],
					[0,1,1,0],
					[1,1,0,0],
					[0,0,0,0]
				],
				[
					[0,1,0,0],
					[0,1,1,0],
					[0,0,1,0],
					[0,0,0,0]
				]
			];
	
	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);	

	// Figura O
	color = "#FFFF00";
	figure = [
				[
					[0,1,1,0],
					[0,1,1,0],
					[0,0,0,0],
					[0,0,0,0]
				]
			];
	
	tetris = {color: color, figure: figure};
	tetrominoesArray.push(tetris);
}

function generateNextTetromino()
{
		nextTetromino = null;

		var tetromino_values = tetrominoesArray[Math.floor( Math.random() * tetrominoesArray.length)];

		nextTetromino = new TetrisObject();
		nextTetromino.color = tetromino_values.color;
		nextTetromino.figure = tetromino_values.figure;

		nextTetromino.rotation = 0;	
		nextTetromino.x = 12;

		nextTetromino.y = 0;
		if (nextTetromino.figure[0][0].indexOf(1) == -1) 
			nextTetromino.y = -1;
}

function generateTetromino()
{
	if(!gameOver)
	{		
		tetromino = null;
		tetromino = nextTetromino;
		generateNextTetromino();

		tRow = 0;
		tCol = 3;

		tetromino.x = tCol;

		if (tetromino.figure[0][0].indexOf(1) == -1) 
			tRow = -1;	

		tetromino.y = tRow;

		if (!tetromino.canFit(tRow, tCol, tetromino.rotation)) 
		{
			gameOver = true;
		}

	}
}

function landTetromino()
{

	for(var row = 0; row < tetromino.figure[tetromino.rotation].length; row++)
	{
		for(var col = 0; col < tetromino.figure[tetromino.rotation][row].length; col++)
		{		
			var number = tetromino.figure[tetromino.rotation][row][col];
			if(number == 1/* && row + tetromino.y >= 0 && col + tetromino.x >= 0 && col + tetromino.x <= fieldArray[0].length-1*/)
			{
				fieldArray[row + tetromino.y][col + tetromino.x].graphics.strokeWidth = 0;
				fieldArray[row + tetromino.y][col + tetromino.x].graphics.strokeColor = "#000000";
				fieldArray[row + tetromino.y][col + tetromino.x].graphics.rectColor = tetromino.color;
				fieldArray[row + tetromino.y][col + tetromino.x].graphics.x = (col + tetromino.x);
				fieldArray[row + tetromino.y][col + tetromino.x].graphics.y = (row + tetromino.y);
				fieldArray[row + tetromino.y][col + tetromino.x].closed = 1;
			}
		}
	}

	var str = "";
	for(var row = 0; row < fieldArray.length; row++)
	{
		for(var col = 0; col < fieldArray[0].length; col++)
		{		
			str+= fieldArray[row][col].closed+" ";
		}
		str+="\n";
	}

	// console.log(str);

	checkForLines();
	generateTetromino();
	count_timer = 0;
}

function checkForLines()
{
	var row, col;

	for (row = 0; row < fieldArray.length; row++) {
		var counter = 0;
		for (col = 0; col < fieldArray[0].length; col++) {
			if(fieldArray[row][col].closed == 1)
				counter++;
		}

		// La fila ya esta completa
		if(counter >= fieldArray[row].length)
		{
			for(col = 0; col < fieldArray[0].length; col++)
			{
				fieldArray[row][col].closed = 0;
				fieldArray[row][col].graphics.rectColor = fieldArray[row][col].graphics.prevColor;
			}

			// Subimos desde la fila actual hasta el inicio

			for(var currentRow = row; currentRow >= 0; currentRow--)
			{
				for(col = 0; col < fieldArray[0].length; col++)
				{
					if(fieldArray[currentRow][col].closed == 1)
					{
						var current_color = fieldArray[currentRow][col].graphics.rectColor;

						fieldArray[currentRow][col].closed = 0;
						fieldArray[currentRow][col].graphics.rectColor = fieldArray[currentRow][col].graphics.prevColor;

						fieldArray[currentRow+1][col].closed = 1;
						fieldArray[currentRow+1][col].graphics.rectColor = current_color;

					}
				}
			}

		}

	}

}
/*************************************************************/

//
function init()
{
	count_timer = 0;
	fieldArray = [];
	tetrominoesArray = [];
	tetromino = null;
	gameOver = false;
	nextTetromino = -1;

	generarCampoDeJuego();
	initTetrominoes();

	generateNextTetromino();
	generateTetromino();
}

//
function thread()
{

    var now = new Date().getTime(), dt = (1 / (now - (time || now)));
    time = now;
    count_timer += dt;

	draw();
	update();
	requestAnimFrame(thread);
}

//
function draw()
{
	var row, col;

	context.clearRect(0, 0, WIDTH, HEIGHT);
	context.fillStyle = "#333333 ";
	context.fillRect(0, 0, WIDTH, HEIGHT);

	// Dibujamos el campo para el juego de tetris
	for(row = 0; row < fieldArray.length; row++)
	{
		for(col = 0; col < fieldArray[0].length; col++)
		{
			var sprite = fieldArray[row][col];
			sprite.draw();
		}
	}
	// Finalizamos el dibujado del campo de tetris.

	tetromino.draw();

	nextTetromino.draw();

}

//
function update()
{
	
	if(count_timer >= TIMER_TIME && !gameOver)
	{
		if (tetromino.canFit(tRow + 1, tCol, tetromino.rotation)) {
		    tRow++;
		    tetromino.y = tRow;
		} else {
		    landTetromino();
		}
		
		count_timer = 0;
	}
}

//

jQuery(document).keydown(function(e)
{
	if(tetromino == null || gameOver)
		return;

	var key = e.which;

	if(key == 38) // Arriba
	{
		var ct = tetromino.rotation;
		var rot = (ct + 1) % tetromino.figure.length;
		if (tetromino.canFit(tRow, tCol, rot)) {
			tetromino.rotation = rot;
		}		
	}
	else if(key == 37) // Izquierda
	{
		if(tetromino.canFit(tRow, tCol - 1, tetromino.rotation))
		{
			tCol--;
			tetromino.x = tCol;
		}
	}
	else if(key == 39) // Derecha
	{
		if(tetromino.canFit(tRow, tCol + 1, tetromino.rotation))
		{
			tCol++;
			tetromino.x = tCol;
		}		
	}
	else if(key == 40) // Abajo
	{
		if(tetromino.canFit(tRow + 1, tCol, tetromino.rotation))
		{
			tRow++;
			tetromino.y = tRow;
		}
		else
		{
			landTetromino();
		}	
	}
	else if(key == 32) // Espacio
	{
	}
});

//

init();
requestAnimFrame(thread);