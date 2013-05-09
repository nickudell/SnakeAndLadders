//Canvas properties
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 600;

var canvas;
var context;

//Game loop properties
var loopTimeout;
var isPlaying = true;
var FPS = 50;
var prevTime = Date.now();

var timeString;
var mouse = {
	x: 0,
	y: 0
};
var player;

function Player()
{
	var DIRECTIONS = {
		UP: "up",
		DOWN: "down",
		LEFT: "left",
		RIGHT: "right"
	};
	var previousSteps = [
	{
		x: 160,
		y: 400},
	{
		x: 160,
		y: 350},
	{
		x: 160,
		y: 300}];
	this.x = 160;
	this.y = 400;
	var previousDirection = DIRECTIONS.UP;
	this.direction = DIRECTIONS.UP;
	this.width = 32;
	this.height = 32;
	this.speed = 0.00001;
	this.level = 1;
	var chunkSize = 50;
	var COLOURS = ['FF0', '0F0', '00F'];
	//draw the player as a blue square
	this.draw = function()
	{
		//context.fillStyle = COLOURS[this.level];
		context.strokeStyle = 'FFF';
		context.lineWidth = chunkSize;
		context.beginPath();
		context.moveTo(this.x, this.y);
		for (var i = 0; i < previousSteps.length; i++)
		{
			context.lineTo(previousSteps[i]);
		}
		context.stroke();
	};

	this.update = function(deltaTime)
	{
		//Move the head forward until it's a full chunk along
		switch (this.direction)
		{
			case DIRECTIONS.UP:
				if (previousDirection != DIRECTIONS.UP)
				{
					//we have changed direction mid block extrusion
					//get the distance moved so far and apply it in the up direction
					var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
					this.x = previousSteps[0].x;
					this.y = previousSteps[0].y - distance;
					previousDirection = DIRECTIONS.UP;
				}
				//Move forwards
				this.y -= this.speed * deltaTime;
				//check if we've moved into another cell
				var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
				distance -= chunkSize;
				if (distance >= 0)
				{
					previousSteps.pop();
					previousSteps.unshift(
					{
						x: this.x,
						y: previousSteps[0].y + chunkSize
					});
				}
				break;
			case DIRECTIONS.DOWN:
				if (previousDirection != DIRECTIONS.DOWN)
				{
					//we have changed direction mid block extrusion
					//get the distance moved so far and apply it in the up direction
					var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
					this.x = previousSteps[0].x;
					this.y = previousSteps[0].y + distance;
					previousDirection = DIRECTIONS.DOWN;
				}
				//Move forwards
				this.y += this.speed * deltaTime;
				//check if we've moved into another cell
				var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
				distance -= chunkSize;
				if (distance >= 0)
				{
					previousSteps.pop();
					previousSteps.unshift(
					{
						x: this.x,
						y: previousSteps[0].y - chunkSize
					});
				}
				break;
			case DIRECTIONS.LEFT:
				if (previousDirection != DIRECTIONS.LEFT)
				{
					//we have changed direction mid block extrusion
					//get the distance moved so far and apply it in the up direction
					var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
					this.x = previousSteps[0].x - distance;
					this.y = previousSteps[0].y;
					previousDirection = DIRECTIONS.LEFT;
				}
				//Move forwards
				this.x -= this.speed * deltaTime;
				//check if we've moved into another cell
				var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
				distance -= chunkSize;
				if (distance >= 0)
				{
					previousSteps.pop();
					previousSteps.unshift(
					{
						x: previousSteps[0].x + chunkSize,
						y: this.y
					});
				}
				break;
			case DIRECTIONS.RIGHT:
				if (previousDirection != DIRECTIONS.RIGHT)
				{
					//we have changed direction mid block extrusion
					//get the distance moved so far and apply it in the up direction
					var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
					this.x = previousSteps[0].x + distance;
					this.y = previousSteps[0].y;
					previousDirection = DIRECTIONS.RIGHT;
				}
				//Move forwards
				this.x += this.speed * deltaTime;
				//check if we've moved into another cell
				var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
				distance -= chunkSize;
				if (distance >= 0)
				{
					previousSteps.pop();
					previousSteps.unshift(
					{
						x: previousSteps[0].x - chunkSize,
						y: this.y
					});
				}
				break;
		}
		//Move the tail by distance
		//Find the direction the tail should move in
		var distance = Math.sqrt((this.x - previousSteps[0].x) * (this.x - previousSteps[0].x) + (this.y - previousSteps[0].y) * (this.y - previousSteps[0].y));
		var xDiff = previousSteps[previousSteps.length - 2].x - previousSteps[previousSteps.length - 1].x;
		var yDiff = previousSteps[previousSteps.length - 2].y - previousSteps[previousSteps.length - 1].y;
		//Normalize to +-1 or 0
		if (xDiff < 0) xDiff = -1;
		if (xDiff > 0) xDiff = 1;
		if (yDiff < 0) yDiff = -1;
		if (yDiff > 0) yDiff = 1;

		previousSteps[previousSteps.length - 1].x += xDiff * distance;
		previousSteps[previousSteps.length - 1].y += yDiff * distance;
	}
}

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
	})

	context = canvas.getContext("2d");

	canvases.appendTo('body');

	player = new Player();

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
	Clear('000');
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

function canvasClicked()
{

	}

//Clear the screen
var Clear = function(colour)
{
	//Set active colour to specified parameter
	context.fillStyle = colour;
	//draw rectangle from point (0,0) to (width, height)
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
};

var Update = function(deltaTime)
{
	player.update(deltaTime);
};

var Draw = function()
{
	player.draw();
};

Init();