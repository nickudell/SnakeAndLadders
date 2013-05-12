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
var stairs = [];
var fruits = [];
var COLOURS = ['FF0', '0F0', 'F0F'];
var DIRECTIONS = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var score = 0;

function opposite(direction)
{
	switch (direction)
	{
		case DIRECTIONS.UP:
			return DIRECTIONS.DOWN;
		case DIRECTIONS.DOWN:
			return DIRECTIONS.UP;
		case DIRECTIONS.LEFT:
			return DIRECTIONS.RIGHT;
		case DIRECTIONS.RIGHT:
			return DIRECTIONS.LEFT;
	}
}

function Player()
{
	var head = {
		x: 160,
		y: 360,
		z: 1,
		width: 5,
		height: 5
	};
	var body = [
	{
		x: 160,
		y: 365,
		z: 1,
		width: 5,
		height: 5},
	{
		x: 160,
		y: 370,
		z: 1,
		width: 5,
		height: 5},
	{
		x: 160,
		y: 375,
		z: 1,
		width: 5,
		height: 5}];
	var tail = {
		x: 160,
		y: 380,
		z: 1,
		width: 5,
		height: 5
	};

	var tailDirection = DIRECTIONS.UP;

	var previousDirection = DIRECTIONS.UP;
	this.direction = DIRECTIONS.UP;
	this.speed = 0.05;
	var chunkSize = 5;

	var that = this;

	//draw the player as a blue square
	this.draw = function()
	{
		context.save();
		//draw in height order
		for (var i = 0; i <= 2; i++)
		{
			context.fillStyle = COLOURS[i];
			var boxes = body.filter(function(box)
			{
				return box.z == i;
			});
			if (tail.z == i)
			{
				context.fillRect(tail.x, tail.y, tail.width, tail.height);
			}
			boxes.forEach(function(box)
			{
				context.fillRect(box.x, box.y, box.width, box.height);
			});
			if (head.z == i)
			{
				context.fillRect(head.x, head.y, head.width, head.height);
			}
		}
		context.restore();
	};

	function shiftBody(x, y, z)
	{
		body.unshift(
		{
			x: x,
			y: y,
			z: z,
			width: chunkSize,
			height: chunkSize
		});
		tail = body[body.length - 1];
		body.pop();
		if (tail.x > body[body.length - 1].x)
		{
			//tail is to the right of the body
			that.tailDirection = DIRECTIONS.RIGHT;
		}
		else if (tail.x < body[body.length - 1].x)
		{
			that.tailDirection = DIRECTIONS.LEFT;
		}
		else if (tail.y > body[body.length - 1].y)
		{
			that.tailDirection = DIRECTIONS.DOWN;
		}
		else
		{
			that.tailDirection = DIRECTIONS.UP;
		}
	}

	this.update = function(deltaTime)
	{
		//detect direction changes
		if (this.direction != DIRECTIONS.RIGHT && keydown.left)
		{
			//move existing motion over
			if (head.height < chunkSize)
			{
				if (this.direction == DIRECTIONS.UP)
				{
					head.y += head.height;
				}
				else
				{
					head.y -= chunkSize;
				}
				head.x -= head.height;
				head.width = head.height;
				head.height = chunkSize;
			}
			this.direction = DIRECTIONS.LEFT;
		}
		if (this.direction != DIRECTIONS.LEFT && keydown.right)
		{
			//move existing motion over
			if (head.height < chunkSize)
			{
				if (this.direction == DIRECTIONS.UP)
				{
					head.y += head.height;
				}
				else
				{
					head.y -= chunkSize;
				}
				head.x += chunkSize;
				head.width = chunkSize - head.height;
				head.height = chunkSize;
			}
			this.direction = DIRECTIONS.RIGHT;
		}
		if (this.direction != DIRECTIONS.DOWN && keydown.up)
		{
			//move existing motion over
			if (head.width < chunkSize)
			{
				if (this.direction == DIRECTIONS.LEFT)
				{
					head.x += head.width;
				}
				else
				{
					head.x -= chunkSize;
				}
				//head.x -= chunkSize;
				head.y -= head.width;
				head.height = head.width;
				head.width = chunkSize;
			}
			this.direction = DIRECTIONS.UP;
		}
		if (this.direction != DIRECTIONS.UP && keydown.down)
		{
			//move existing motion over
			if (head.width < chunkSize)
			{
				if (this.direction == DIRECTIONS.LEFT)
				{
					head.x += head.width;
				}
				else
				{
					head.x -= chunkSize;
				}
				head.y += chunkSize;
				head.height = head.width;
				head.width = chunkSize;
			}
			this.direction = DIRECTIONS.DOWN;
		}

		var distance = this.speed * deltaTime;
		switch (this.direction)
		{

			case DIRECTIONS.UP:
				//Move the head up
				head.y -= distance;
				head.height += distance;
				if (head.height > chunkSize)
				{
					head.height -= chunkSize;
					distance = head.height;
					//cycle the body
					var x = head.x;
					var y = body[0].y - chunkSize;
					var z = head.z;
					shiftBody(x, y, z);
				}

				break;
			case DIRECTIONS.DOWN:
				//Move the head down
				head.height += distance;
				if (head.height > chunkSize)
				{
					head.height -= chunkSize;
					head.y += chunkSize;
					distance = head.height;
					//cycle the body
					var x = head.x;
					var y = body[0].y + chunkSize;
					var z = head.z;
					shiftBody(x, y, z);
				}

				break;
			case DIRECTIONS.LEFT:
				//Move the head left
				head.x -= distance;
				head.width += distance;
				if (head.width > chunkSize)
				{
					head.width -= chunkSize;
					distance = head.width;
					//cycle the body
					var x = body[0].x - chunkSize;
					var y = head.y;
					var z = head.z;
					shiftBody(x, y, z);
				}

				break;
			case DIRECTIONS.RIGHT:
				//Move the head right
				head.width += distance;
				if (head.width > chunkSize)
				{
					head.width -= chunkSize;
					head.x += chunkSize;
					distance = head.width;
					//cycle the body
					var x = body[0].x + chunkSize;
					var y = head.y;
					var z = head.z;
					shiftBody(x, y, z);
				}
				break;
		}
		//Move the tail up
		switch (this.tailDirection)
		{
			case DIRECTIONS.UP:
				//Move the tail down
				tail.y += distance;
				tail.height -= distance;
				break;
			case DIRECTIONS.DOWN:
				//Move the tail up
				tail.height -= distance;
				break;
			case DIRECTIONS.LEFT:
				//Move the tail right
				tail.x += distance;
				tail.width -= distance;
				break;
			case DIRECTIONS.RIGHT:
				//Move the tail left
				tail.width -= distance;
				break;
		}
		//Detect collisions
		if (this.selfCollided())
		{
			//game over
			console.log("Game Over");
		}
		else
		{
			stairs.forEach(function(stair)
			{
				if (that.collided(stair))
				{
					if (head.z == stair.from && that.direction == stair.direction)
					{
						//Going to the to
						head.z = stair.to;
					}
					else if (head.z == stair.to && that.direction == opposite(stair.direction))
					{
						//Going to the from
						head.z = stair.from;
					}
					else
					{
						//crash
						console.log("Game Over");
					}
				}
			});
			fruits.forEach(function(fruit)
			{
				if (that.collided(fruit))
				{
					fruit.kill();
					score += 100;
					this.speed += 0.05;
					//add extra segment to the snake
					var x = body[body.length - 1].x;
					var y = body[body.length - 1].y;
					var z = body[body.length - 1].z;
					var xDiff = body[body.length - 2].x - body[body.length - 1].x;
					var yDiff = body[body.length - 2].y - body[body.length - 1].y;
					//Normalize to +-1 or 0
					if (xDiff < 0) xDiff = -1;
					if (xDiff > 0) xDiff = 1;
					if (yDiff < 0) yDiff = -1;
					if (yDiff > 0) yDiff = 1;

					x += chunkSize * xDiff;
					y += chunkSize * yDiff;
					body[body.length - 1].x = body[body.length - 2].x + chunkSize * xDiff;
					body[body.length - 1].y = body[body.length - 2].y + chunkSize * yDiff;
					body.push(
					{
						x: x,
						y: y,
						z: z,

					});
				}
			});
		}
	}

	this.collided = function(other)
	{

		return head.z == other.z && head.x + head.width >= other.x && head.x <= other.x + other.width && head.y + head.height >= other.y && head.y <= other.y + other.height;
	}

	this.selfCollided = function()
	{
		var collided = true;
		body.forEach(function(step)
		{
			collided &= step.x + chunkSize >= that.x && step.x <= that.x + that.width && step.y + chunkSize >= that.y && step.y <= that.y + that.height;
		});
		return collided;
	}
}

function Stair(x, y, from, to, direction, bidirectional)
{
	this.x = x || 0;
	this.y = y || 0;
	this.width = 16;
	this.height = 16;
	this.from = from || 1;
	this.to = to || 2;
	this.direction = direction || DIRECTIONS.LEFT; //which way you enter the stair to go from from to to
	this.bidirectional = bidirectional || false;
	this.collided = false; //set to true while the snake head is inside the stair to prevent bogus game overs
	var gradient;
	switch (direction)
	{
		case DIRECTIONS.UP:
			gradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
			gradient.addColorStop(0, COLOURS[to]);
			gradient.addColorStop(1, COLOURS[from]);
			break;
		case DIRECTIONS.DOWN:
			gradient = context.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
			gradient.addColorStop(0, COLOURS[from]);
			gradient.addColorStop(1, COLOURS[to]);
			break;
		case DIRECTIONS.LEFT:
			gradient = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
			gradient.addColorStop(0, COLOURS[to]);
			gradient.addColorStop(1, COLOURS[from]);
			break;
		case DIRECTIONS.RIGHT:
			gradient = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
			gradient.addColorStop(0, COLOURS[from]);
			gradient.addColorStop(1, COLOURS[to]);
			break;
	}
	this.draw = function()
	{
		context.save();
		context.fillStyle = gradient;
		context.shadowColor = gradient;
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	}
}

function Fruit(x, y, z)
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 1;
	this.width = 10;
	this.height = 10;

	var active = true;

	this.isActive = function()
	{
		return active;
	}

	this.draw = function()
	{
		context.save();
		context.fillStyle = COLOURS[z];
		context.shadowColor = COLOURS[z];
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	}

	this.kill = function()
	{
		active = false;
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

	stairs = [new Stair(100, 100, 1, 2, DIRECTIONS.RIGHT, true)];

	for (var i = 0; i < 5; i++)
	{
		fruits.push(new Fruit(10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
		10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
		Math.floor(Math.random() * 4)));
	}

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
	stairs.forEach(function(s)
	{
		s.draw();
	});
	fruits.forEach(function(f)
	{
		f.draw();
	});
	fruits = fruits.filter(function(f)
	{
		return f.isActive();
	});
	context.save();
	context.globalCompositeOperation = "lighter";
	context.fillStyle = 'FFF';
	context.shadowColor = '0FF';
	context.shadowBlur = 8;
	context.font = '32pt Helvetica';
	context.fillText("Score: " + score, 32, 50);
	context.restore();
};

Init();