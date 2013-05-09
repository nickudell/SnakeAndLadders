//Canvas properties
var CANVAS_WIDTH = 320;
var CANVAS_HEIGHT = 200;

var canvas;
var context;

//Game loop properties
var loopTimeout;
var isPlaying = true;
var FPS = 50;
var prevTime = Date.now();

var timeString;

var player = {
	color: "#00A",
	x: 160,
	y: 100,
	width: 32,
	height: 32,
	//draw the player as a blue square
	draw: function()
	{
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
	}
};

//Initialize variables and start the game
var Init = function()
{
	console.log("Initialization entered.")
	//Get the canvas
	var canvases = $("<canvas id='canvas' width='" + CANVAS_WIDTH +
		"' height='" + CANVAS_HEIGHT + "'></canvas");
	canvas = canvases[0];
	//respond to mouse clicks
	canvas.addEventListener('click', canvasClicked, true);
	//prevent double clicks from selecting text all over the place
	canvas.addEventListener('selectstart', function(e)
	{
		e.preventDefault();
		return false;
	});
	//respond to mouse motion
	canvas.addEventListener('mousemove', function(e)
	{
		mouse.x = e.offsetX;
		mouse.y = e.offsetY;
		mouse.currentCell = getCell(mouse.x, mouse.y);
	})

	context = canvas.getContext("2d");

	canvases.appendTo('body');

	//Start game loop
	Tick();
	console.log("Initialization exited.")
};

//The game loop
var Tick = function()
{
	//Update time difference
	var now = Date.now();
	var deltaTime = now - prevTime;
	prevTime = now;
	Clear('AAAAFF');
	Update(deltaTime);
	Draw()

	if (isPlaying)
	{
		loopTimeout = setTimeout(Tick, 1000 / FPS);
	}
	else
	{
		console.log('Exiting normally.');
	}
};

//Clear the screen
var Clear = function(colour)
{
	//Set active colour to specified parameter
	context.fillStyle = colour;
	//start drawing
	context.beginPath();
	//draw rectangle from point (0,0) to (width, height)
	context.rect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
	//end drawing
	context.closePath();
	//Fill the rectangle with the active colour
	context.fill();
};

var Update = function(deltaTime)
{
	//display the delta time only when the space key is held down
	if (keydown.space)
	{
		timeString = "Time difference: " + deltaTime;
	}
	else
	{
		timeString = "";
	}
};

var Draw = function()
{
	player.draw();
	context.fillText(timeString, 50, 50);
};

Init();