# Traveling salesman solver

Best case runtime roughly O(n^3), worst case roughly O(n^3*n!).

Uses the principle that points arranged in a circle have the shortest path when the path looks circular. Attempts to make the most circular path possible given a set of points.
Works by starting with a convex hull around the set of all points and building successive concave hulls on the remaining set of points. Removes 1 point from the internal points that is closest to the concave hull, and builds a new concave hull, then removes another point, etc. Not guaranteed to find the best solution, but will find a very good solution very quickly. Will have to split the solution tree into n-i branches every time it sees n-i internal points (usually 2) that are equidistant from the hull on an average contribution basis, so worst case runtime is roughly n! times the algo. This tends to happen when you tightly "pack" points into a problem space, for example putting 99 points into a (0, 9) by (0, 9) integer problem space will generate a very large number of branches every iteration.

Depends on hull.js to construct convex hulls.

## Installation

```
npm install
```

## Running

Generate a random problem with n (x, y) nodes between 0 and x_size/0 and y_size and solve it:

```
./salesman_solver.js [node_count] [x_size] [y_size]
```

Or you can feed an existing problem into it by uncommenting the appropriate code block in salesman_solver.js.


## Sample problems

Some trivial problems that have been generated and solved by the script are available in the `sample_problems` folder and can be analyzed with geogebra.
