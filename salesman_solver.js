#!/usr/bin/env node

if(require){
	var helpers = require('./salesman_helpers.js')
	var fs = require('fs')
}

helpers.disableLogging();

var start_time = Date.now();

//construct problem

var map = [], problem_size = process.argv[2] || 10;

var newX, newY;

var checkMapDuplicate = function(x, y){
	if(typeof x === "undefined") return true;
	for (var i = 0; i < map.length; i++) {
		if(map[i].x === x && map[i].y === y) return true;
	}
	return false;
}

for (var i = 0; i < problem_size; i++) {

	while(checkMapDuplicate(newX, newY)){
		newX = helpers.intRand(0, 10)
		newY = helpers.intRand(0, 10)
	}

	map.push({
		i: i,
		x: newX,
		y: newY,
		d: {},
		l: {}
	})
}

map.forEach(function(point){
	point.x *= 10;
	point.y *= 10;
})

//Or feed in an existing problem

// var map = [ 
// 	{ i: 0,
// 	x: 4,
// 	y: 10,
// 	},
// 	{ i: 1,
// 	x: 2,
// 	y: 8,
// 	},
// 	{ i: 2,
// 	x: 7,
// 	y: 0,
// 	},
// 	{ i: 3,
// 	x: 3,
// 	y: 4,
// 	},
// 	{ i: 4,
// 	x: 9,
// 	y: 10,
// 	},
// 	{ i: 5,
// 	x: 5,
// 	y: 7,
// 	},
// 	{ i: 6,
// 	x: 8,
// 	y: 6,
// 	},
// 	{ i: 7,
// 	x: 6,
// 	y: 9,
// 	},
// 	{ i: 8,
// 	x: 14,
// 	y: 7,
// 	},
// 	{ i: 9,
// 	x: 7,
// 	y: 7,
// 	}, 
// 	]

// Or feed in a problem from an external source

// var map = [];

// var map_input = fs.readFileSync('salesman/traveling-salesman-master/input', {encoding: 'utf8'});

// map_input.split('\n').forEach(function(point){
// 	var point_arr = point.split(" ");

// 	map.push({
// 		i: point_arr[0],
// 		x: point_arr[1],
// 		y: point_arr[2]
// 	});
// });

//find distances & lines betwen the points

//number of points
var m = map.length;

for (var i = 0; i < m; i++) {
	map[i].d = {}
	// map[i].l = {}
	for (var j = 0; j < m; j++) {
		if (i === j) continue;
		map[i].d[j] = helpers.distance(map[i].x, map[i].y, map[j].x, map[j].y)
		// map[i].l[j] = helpers.lineFromPoints(map[i].x, map[i].y, map[j].x, map[j].y)
	}
}

//print out the completed map for reference

console.info("MAP START")
console.info("[")
for (var i = 0; i < map.length; i++) {
	console.info(map[i])
	console.info(",")
};
console.info("]")
console.info("MAP END")

///start solving the problem

var internalPoints = map.concat()
, path
, l
, i
, solutions = []
, first_solution = {};

//find the external polygon
path = helpers.findOutsidePolygon(internalPoints)
//remove the external polygon points from internal points
for(i = -1, l = path.length; ++i < l;){
	internalPoints.splice(internalPoints.indexOf(path[i]), 1)
}

first_solution.path = path;
first_solution.internalPoints = internalPoints;
first_solution.solved = false;
first_solution.finalSum = 0;

solutions[0] = first_solution;

//handling equal lowest cost paths:
//have a set of all solutions = [], that are marked as either solved or unsolved. loop until all have been solved, then pick the lowest cost one(s) out of those.
//when you get a set of lowest cost paths that are equal during solving one of the solutions, pick the first one and continue solving it, and add the other states onto the solutions queue as unsolved.
//a state is the combination of external polygon (path) and internal points at that instant in time.

var first_outside_point,
second_outside_point,
outside_point_distance,
j, m, k, n, kk, jkk,
internal_polygon,
distance_between_points,
path_length,
possible_lowest_paths,
lowest_path,
first_lowest_path,
lower_lowest_path,
equal_lowest_path,
current_path,
avg_contribution,
current_solution,
reversed_path,
alternative_path,
alternative_internal_points;

var everythingSolved = function(){
	var result = true;

	solutions.forEach(function(solution){
		if(solution.solved === false){
			result = solution;
		}
	})

	return result;
}

while((current_solution = everythingSolved()) !== true){
	// console.info("current_solution ", current_solution)
	internalPoints = current_solution.internalPoints;
	path = current_solution.path;

	while(internalPoints.length > 0){

		internal_polygon = helpers.findOutsidePolygon(internalPoints)
		
		possible_lowest_paths = [];

		//find the best set of points to move from the internal points to the result path
		for(i = -1, l = path.length; ++i < l;){
			first_outside_point = path[i]
			second_outside_point = path[ (i+1) % path.length ]

			outside_point_distance = first_outside_point.d[second_outside_point.i]

			for(j = -1, m = internal_polygon.length; ++j < m;){
				for(k = -1, n = internal_polygon.length; ++k < n;){

					//calculate total path contribution
					current_path = []

					if(j <= k){
						distance_between_points = k - j;
					}else{
						distance_between_points = internal_polygon.length - j + k;
					}

					path_length = first_outside_point.d[internal_polygon[j].i]

					for(kk = -1; ++kk < distance_between_points;){
						jkk = (j + kk) % internal_polygon.length;
						current_path.push(internal_polygon[jkk])

						path_length += internal_polygon[ jkk ].d[ internal_polygon[(jkk + 1) % internal_polygon.length].i ]
					}

					//push the remaining point after the loop (or the only point if there was no loop)
					current_path.push(internal_polygon[(j + kk) % internal_polygon.length])

					path_length += internal_polygon[k].d[second_outside_point.i]

					//calculate avg path contribution
					console.log(path_length, outside_point_distance, current_path.length, (path_length - outside_point_distance)/current_path.length)

					avg_contribution = (path_length - outside_point_distance)/current_path.length;

					first_lowest_path = possible_lowest_paths.length === 0;
					if(first_lowest_path){
						lower_lowest_path = false;
						equal_lowest_path = false;
					}else{
						lower_lowest_path = avg_contribution < possible_lowest_paths[0].avg_contribution;
						equal_lowest_path = avg_contribution === possible_lowest_paths[0].avg_contribution;
					}

					//get all the paths that are the best right now
					if(first_lowest_path || lower_lowest_path || equal_lowest_path){
						lowest_path = {
							current_path: current_path.concat(),
							insert_index: path.indexOf(first_outside_point) + 1,
							avg_contribution: avg_contribution
						}

						if(first_lowest_path || lower_lowest_path){
							possible_lowest_paths = [lowest_path]
						}else if(equal_lowest_path){
							possible_lowest_paths.push(lowest_path)
						}
					}

				}
			}
		}	

		// if(possible_lowest_paths.length > 1) console.info(possible_lowest_paths.length, possible_lowest_paths)

		//first generate alternative paths off the unaltered path
		possible_lowest_paths.forEach(function(lowest_path, index){
			//skip first path
			if(index === 0) return;

			//move the points in the best proposed path from the internal points to the result path
			reversed_path = lowest_path.current_path.reverse()

			//if it's an alternative path, create a new solution instance
			alternative_path = path.concat();
			alternative_internal_points = internalPoints.concat();

			for(i = -1, l = reversed_path.length; ++i < l;){
				// console.info("alternative solution: inserting ", lowest_path.current_path, "at index", lowest_path.insert_index, "into ", path)

				alternative_path.splice(lowest_path.insert_index, 0, reversed_path[i])
				alternative_internal_points.splice(alternative_internal_points.indexOf(reversed_path[i]), 1)
			}

			solutions.push({
				path: alternative_path,
				internalPoints: alternative_internal_points,
				solved: false,
				finalSum: 0
			})
		})

		//then alter the path with the first result

		//move the points in the best proposed path from the internal points to the result path
		reversed_path = possible_lowest_paths[0].current_path.reverse()
		
		for(i = -1, l = reversed_path.length; ++i < l;){
			// if(possible_lowest_paths.length > 1) console.info("first solution: inserting ", possible_lowest_paths[0].current_path, "at index", possible_lowest_paths[0].insert_index, "into ", path)

			path.splice(possible_lowest_paths[0].insert_index, 0, reversed_path[i])
			internalPoints.splice(internalPoints.indexOf(reversed_path[i]), 1)
		}
	}

	current_solution.solved = true;

	for (var i = 0; i < path.length; i++) {
		current_solution.finalSum += path[i].d[path[ (i+1) % path.length ].i]
	}
}

//////////////////////////////////
///problem finished, output answer

console.info("FINAL SHORTEST PATHS:")

solutions.sort(function(a, b){
	return a.finalSum - b.finalSum;
})

solutions.forEach(function(solution, index){
	if(solution.finalSum !== solutions[0].finalSum){
		solutions.splice(solutions.indexOf(solution), 1)
	}
})

solutions[0].path.sort(function(a,b){
	return a.i - b.i;
})

solutions[0].path.forEach(function(point){
	console.info(point.i + " -> " + point.x +", "+point.y)
})

console.info(solutions[0].finalSum)
// solutions.forEach(function(solution){
// 	console.info(solution.finalSum)
// 	solution.path.forEach(function(element){
// 		console.info(element.i, element.x, element.y);
// 	})
// })

console.info("DONE. TOOK: ", Date.now() - start_time, "ms")