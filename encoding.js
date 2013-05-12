function decrypt(x, y, cellWidth, cellHeight, number)
{
	var bits = byte2bits(number);
	if (bits[0])
	{
		if (bits[1])
		{
			//Spawn point
			var direction = num2Direction(bits.slice(4, 2));
			var level = bits2byte(bits.slice(6, 2));
			spawn = {
				x: x,
				y: y,
				direction: direction,
				z: level
			};
		}
		else
		{
			if (bits[3])
			{
				return;
			}
			//Wall
			if (bits[5])
			{
				//wall covers all levels
				walls.push(new GreatWall(x, y, cellWidth, cellHeight));
			}
			else
			{
				//Wall covers specific level
				var level = bits2byte(bits.slice(4, 2));
				walls.push(new Wall(x, y, cellWidth, cellHeight, level));
			}
		}

	}
	else
	{
		//is a ladder
		var direction = num2Direction(bits.slice(2, 2));
		var to = bits2byte(bits.slice(4, 2));
		var from = bits2byte(bits.slice(6, 2));
		stairs.push(new Stair(x, y, from, to, direction, bits[1]));
	}
}

function num2Direction(num)
{
	var DIRECTIONS = {
		UP: "up",
		DOWN: "down",
		LEFT: "left",
		RIGHT: "right"
	};
	return DIRECTIONS[num];
}

function bits2byte(b)
{
	var scale = 1;
	var result = 0;
	for (var i = b.length; - 1 i >= 0; i--)
	{
		result += b[i] * scale;
		scale *= 2;
	}
	return result;
}

function byte2bits(a)
{
	var tmp = [];
	for (var i = 128; i >= 1; i /= 2)
	{
		tmp.push(a & i ? 1 : 0);
	}
	return tmp;
}