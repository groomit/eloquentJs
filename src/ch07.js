import "./styles.css";

//raw graph data
const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  "Marketplace-Farm",
  "Marketplace-Post Office",
  "Marketplace-Shop",
  "Marketplace-Town Hall",
  "Shop-Town Hall"
];

//generate a structured object by adding properties and values to obj
function addNode(obj, from, to) {
  if (obj[from] == null) {
    obj[from] = [to];
  } else {
    obj[from].push(to);
  }
}

//the actual graph creation - make graph for both combinations from -> to and to -> from
function makeGraph(arr) {
  let ret = Object.create(null);

  for (let [from, to] of arr.map(r => r.split("-"))) {
    addNode(ret, from, to);
    addNode(ret, to, from);
  }

  return ret;
}

const roadGraph = makeGraph(roads);
console.log(roadGraph);

//instead of creating multible objects to simulate the town, parcels and robots, the author suggested to keep it
// as a simple function and calculate a new state for each move.
// a state holds a current position "place" and an array of parcels. The only methods it has is the move-function, where
// the magic happens and the static random-function, which creates a state with a random set of parcels
class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    //In case there is no direct connection from place to destination, return the current state, ...
    if (!roadGraph[this.place].includes(destination)) return this;
    else {
      //... otherwise deliver parcels and update their location
      let parcels = this.parcels
        .map(p => {
          if (p.place === this.place)
            return { place: destination, address: p.address };
          else return p;
        })
        .filter(p => p.address !== destination);
      //... and create a new state with place = destination..
      return new VillageState(destination, parcels);
    }
  }

  // called as VillageState.random(). Creates a set of random parcels with {place, address}
  static random(count = 5) {
    let parcels = [];
    for (let i = 0; i < count; i++) {
      let place = randomPick(Object.keys(roadGraph));
      let address = "";

      do {
        address = randomPick(Object.keys(roadGraph));
      } while (address === place);

      parcels.push({ place: place, address: address });
    }

    return new VillageState("Post Office", parcels);
  }
}

//Pick a random array item
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//Test
/*
console.log(VillageState.random().parcels);
 
let state = new VillageState("Post Office",[{place:"Post Office", address:"Bob's House"},{place:"Post Office", address:"Alice's House"}]);
console.log(state.parcels);
let newState = state.move("Alice's House");
console.log(newState.parcels);
let evenNewerState = newState.move("Bob's House");
console.log(evenNewerState.parcels);
*/


//#####################################
//first robobt prototype - random delivery
function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}


//#####################################
//second robot prototype - run on a straight delivery road - the robot would have to make this route twice as a maximum number of turns

//define a fixed route for the robot
const mailRoute = [
  "Alice's House",
  "Cabin",
  "Alice's House",
  "Bob's House",
  "Town Hall",
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  "Shop",
  "Grete's House",
  "Farm",
  "Marketplace",
  "Post Office"
];

//The actual robot intelligence. It takes a state and some memory
function routeRobot(state, memory) {
//if the memory is empty, the route will be loaded into it
  if (memory.length === 0) {
    memory = mailRoute;
  }
//the robot returns an action object, with the first memory location as direction and the remaining memory minus the first entry.
// This way the memory will run empty, so that above if-statement is triggered
  return { direction: memory[0], memory: memory.slice(1) };
}


//####################################
//third robot prototype - does some "simple" pathfinding on the graph object




//robot-loop - takes an initial state, a robot function and a memory object
function runRobot(state, robot, memory) {
  let turn = 0;
  console.log(state.parcels);

  for (turn; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Finished in ${turn} turns`);
      break;
    }

    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;

    console.log(`Moved to ${action.direction}`);
  }
}

runRobot(VillageState.random(), routeRobot, []);
