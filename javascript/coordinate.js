var coordinate = function(x, y)
{
	this.x = x;
	this.y = y;
}

coordinate.prototype.copy = function(c)
{
	this.x = c.x;
	this.y = c.y;
}