if(require){
	var hull = require('hull.js')
}

//helpers

var helpers = {};

var backupConsole = console;

helpers.disableLogging = function(){
	console.log = function(){}
}
helpers.enableLogging = function(){
	console.log = backupConsole.log;
}

Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}

var intRand = function (min, max){
	return Math.floor(Math.random()*(max+1-min)+min);
}
helpers.intRand = intRand;

var distance = function(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))
}
helpers.distance = distance;

var lineFromPoints = function(x1, y1, x2, y2){
	//if vertical
	if(x1 === x2){
		return {
			m: x1,
			b: "v"
		}
	}

	var m = (y1 - y2) / (x1 - x2)	
	return {
		m: m,
		b: y1 - x1 * m
	}
}
helpers.lineFromPoints = lineFromPoints;


//given a set of points, find the convex hull that connects all the external vertices
var findOutsidePolygon = function(points){
	if(points.length < 4) return points.concat();

	var path = [], ser_path = [];

	for(var i = -1, l = points.length; ++i < l;){
		ser_path.push([points[i].x, points[i].y]);
	}
	console.log('serialized path', ser_path)

	var convex_hull = hull(ser_path, Infinity).slice(0, -1);

	console.log('convex hull', convex_hull)

	for(var i = -1, l = convex_hull.length; ++i < l;){
		for(var j = -1, m = points.length; ++j < m;){
			if(points[j].x === convex_hull[i][0] && points[j].y === convex_hull[i][1]){
				path.push(points[j]);
			}
		}
	}

	return path;

}
helpers.findOutsidePolygon = findOutsidePolygon;

if(module) module.exports = helpers;