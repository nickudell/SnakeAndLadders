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
var COLOURS = ['FF0', '0F0', '08F'];
var DIRECTIONS = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right"
};

var score = 0;

var level = [
[132, 132, 132, 132, 160, 132, 132, 132, 132],
[132, 160, 160, 160, 160, 160, 160, 160, 132],
[132, 160, 160, 160, 160, 160, 160, 160, 132],
[132, 160, 214, 160, 160, 160, 225, 160, 132],
[160, 160, 160, 160, 193, 160, 160, 160, 160],
[132, 160, 241, 160, 160, 160, 198, 160, 132],
[132, 160, 160, 160, 160, 160, 160, 160, 132],
[132, 160, 160, 160, 160, 160, 160, 160, 132],
[132, 132, 132, 132, 160, 132, 132, 132, 132]
];

var walls = [];

var freeCells = [];

var spawn;

var cellWidth = CANVAS_WIDTH / level[0].length;
var cellHeight = CANVAS_HEIGHT / level.length;

for (var x = 0; x < level[0].length; x++)
{
	for (var y = 0; y < level.length; y++)
	{
		else
		{
			decrypt(x * cellWidth, y * cellHeight, cellWidth, cellHeight, level[y][x]);
		}
	}
}

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

function Player(spawnPoint)
{
	var head = {
		x: spawnPoint.x,
		y: spawnPoint.y,
		z: spawnPoint.z,
		width: 5,
		height: 5
	};
	var offset = {
		x: 0,
		y: 0
	};
	var chunkSize = 5;
	switch (spawnPoint.direction)
	{
		case DIRECTIONS.UP:
			offset.y = -chunkSize
		case DIRECTIONS.DOWN:
			offset.y = chunkSize
		case DIRECTIONS.LEFT:
			offset.x = chunkSize
		case DIRECTIONS.RIGHT:
			offset.x = -chunkSize
	}
	var body = [
	{
		x: 160 + offset.x,
		y: 365 + offset.y,
		z: spawnPoint.z,
		width: 5,
		height: 5},
	{
		x: 160 + offset.x * 2,
		y: 365 + offset.y * 2,
		z: spawnPoint.z,
		width: 5,
		height: 5},
	{
		x: 160 + offset.x * 3,
		y: 365 + offset.y * 3,
		z: spawnPoint.z,
		width: 5,
		height: 5}];
	var tail = {
		x: 160 + offset.x * 4,
		y: 365 + offset.y * 5,
		z: spawnPoint.z,
		width: 5,
		height: 5
	};

	var tailDirection = DIRECTIONS.UP;

	var previousDirection = DIRECTIONS.UP;
	this.direction = DIRECTIONS.UP;
	this.speed = 0.1;

	var that = this;

	//draw the player as a blue square
	this.draw = function(z)
	{
		context.save();
		//draw in height order
		context.fillStyle = COLOURS[z];
		var boxes = body.filter(function(box)
		{
			return box.z == z;
		});
		if (tail.z == z)
		{
			context.fillRect(tail.x, tail.y, tail.width, tail.height);
		}
		boxes.forEach(function(box)
		{
			context.fillRect(box.x, box.y, box.width, box.height);
		});
		if (head.z == z)
		{
			context.fillRect(head.x, head.y, head.width, head.height);
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

	function inBounds()
	{
		return head.x < CANVAS_WIDTH && head.y < CANVAS_HEIGHT && head.y > 0 && head.x > 0;
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
				while (head.height > chunkSize)
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
				while (head.height > chunkSize)
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
				while (head.width > chunkSize)
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
				while (head.width > chunkSize)
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
				if (stair.collided(head))
				{
					if (!stair.isCollided)
					{
						stair.isCollided = true;
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
				}
				else
				{
					if (stair.isCollided)
					{
						stair.isCollided = false;
					}
				}
			});
			fruits.forEach(function(fruit)
			{
				if (fruit.collided(head))
				{
					fruit.kill();
					fruits.push(new Fruit(10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
					10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
					Math.floor(Math.random() * 3)));
					score += 100;
					that.speed += 0.01;
					for (var i = 1; i < 5; i++)
					{
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
				}
			});
		}
		if (!inBounds())
		{
			console.log("Game over");
		}
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
	this.from = from || 0;
	this.to = to || 0;
	this.direction = direction || DIRECTIONS.LEFT; //which way you enter the stair to go from from to to
	this.bidirectional = bidirectional || false;
	this.isCollided = false; //set to true while the snake head is inside the stair to prevent bogus game overs

	this.draw = function(z)
	{
		context.save();
		if (z == this.from || z == this.to)
		{
			context.fillStyle = COLOURS[from];
			context.shadowColor = COLOURS[from];
			context.shadowBlur = 20;
			switch (this.direction)
			{
				case DIRECTIONS.UP:
					context.shadowOffsetY = 5;
					context.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 2);
					context.fillStyle = COLOURS[to];
					context.shadowColor = COLOURS[to];
					context.shadowOffsetY = -5;
					context.fillRect(this.x, this.y, this.width, this.height / 2);
					break;
				case DIRECTIONS.DOWN:
					context.shadowOffsetY = -5;
					context.fillRect(this.x, this.y, this.width, this.height / 2);
					context.fillStyle = COLOURS[to];
					context.shadowColor = COLOURS[to];
					context.shadowOffsetY = 5;
					context.fillRect(this.x, this.y + this.height / 2, this.width, this.height / 2);
					break;
				case DIRECTIONS.LEFT:
					context.shadowOffsetX = 5;
					context.fillRect(this.x + this.width / 2, this.y, this.width / 2, this.height);
					context.fillStyle = COLOURS[to];
					context.shadowColor = COLOURS[to];
					context.shadowOffsetX = -5;
					context.fillRect(this.x, this.y, this.width / 2, this.height);
					break;
				case DIRECTIONS.RIGHT:
					context.shadowOffsetX = -5;
					context.fillRect(this.x, this.y, this.width / 2, this.height);
					context.fillStyle = COLOURS[to];
					context.shadowColor = COLOURS[to];
					context.shadowOffsetX = 5;
					context.fillRect(this.x + this.width / 2, this.y, this.width / 2, this.height);
					break;
			}
		}
		context.restore();
	}
	this.collided = function(other)
	{
		return (other.z == to || other.z == from) && other.x + other.width > this.x + this.width / 4 && other.x < this.x + 3 * this.width / 4 && other.y + other.height > this.y + this.height / 4 && other.y < this.y + 3 * this.height / 4;
	}
}

function Wall(x, y, width, height, level)
{
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.z = level || 0;
	this.update = function(deltaTime)
	{

		}
	this.draw = function()
	{
		context.save();
		context.fillStyle = COLOURS[this.z];
		context.shadowColor = COLOURS[this.z];
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	}

	this.collided = function(other)
	{
		return this.z == other.z && this.x + this.width >= other.x && this.x <= other.x + other.width && this.y + this.height >= other.y && this.y <= other.y + other.height;;;
	}

}

function SpawnPoint(x, y, direction, level)
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = level || 0;
	this.direction = direction || DIRECTIONS.UP;
}

function GreatWall(x, y, width, height)
{
	this.x = x || 0;
	this.y = y || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.colour = 'FFF';
	this.update = function(deltaTime)
	{

		}
	this.draw = function()
	{
		context.save();
		context.fillStyle = this.colour;
		context.shadowColor = this.colour;
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	}

	this.collided = function(other)
	{
		return this.x + this.width >= other.x && this.x <= other.x + other.width && this.y + this.height >= other.y && this.y <= other.y + other.height;;;
	}
}

function Fruit(x, y, z)
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
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
		context.fillStyle = COLOURS[this.z];
		context.shadowColor = COLOURS[this.z];
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.restore();
	}

	this.kill = function()
	{
		active = false;
	}

	this.collided = function(other)
	{
		return this.z == other.z && this.x + this.width >= other.x && this.x <= other.x + other.width && this.y + this.height >= other.y && this.y <= other.y + other.height;;;
	}
}

function randomDirection()
{
	var dir = Math.floor(Math.random() * 4);
	switch (dir)
	{
		case 0:
			return DIRECTIONS.UP;
		case 1:
			return DIRECTIONS.DOWN;
		case 2:
			return DIRECTIONS.LEFT;
		case 3:
			return DIRECTIONS.RIGHT;
	}
	//error state
	console.log("Error picking direction.");
	return DIRECTIONS.UP;
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

	player = new Player(spawnPoint);

	fruits.push(new Fruit(10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
	10 + Math.floor(Math.random() * (CANVAS_WIDTH - 20)),
	Math.floor(Math.random() * 3)));

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
	fruits = fruits.filter(function(f)
	{
		return f.isActive();
	});
};

var Draw = function()
{
	for (var z = 0; z < 3; z++)
	{
		var levelFruits = fruits.filter(function(f)
		{
			return f.z == z;
		});

		levelFruits.forEach(function(f)
		{
			f.draw();
		});

		player.draw(z);

		stairs.forEach(function(s)
		{
			s.draw(z);
		});

		var levelWalls = walls.filter(function(w)
		{
			if (w.z)
			{
				return w.z == z;
			}
			return false;
		});
		levelWalls.forEach(function(w)
		{
			w.draw();
		});


	}

	var greatWalls = walls.filter(function(w)
	{
		return !w.z
	});
	greatWalls.forEach(function(w)
	{
		w.draw();
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