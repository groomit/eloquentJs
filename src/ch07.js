import "./styles.css";

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

function addNode(obj, from, to) {
  if (obj[from] == null) {
    obj[from] = [to];
  } else {
    obj[from].push(to);
  }
}

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

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    //wenn keine direkte Verbindung vom Standort zum Ziel, dann das aktuelle VillageState-Objekt zurückgeben, ...
    if (!roadGraph[this.place].includes(destination)) return this;
    else {
      //... sonst Pakete am neuen Ziel abliefern und aufnehmen
      let parcels = this.parcels
        .map(p => {
          if (p.place === this.place)
            return { place: destination, address: p.address };
          else return p;
        })
        .filter(p => p.address !== destination);
      //... und ein neues Objekt erzeugen mit Standort = Ziel..
      return new VillageState(destination, parcels);
    }
  }

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

function randomRobot(state) {
  return { direction: randomPick(roadGraph[state.place]) };
}

function runRobot(state, robot, memory) {
  let turn = 0;
  console.log(state.parcels);

  for (turn; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Finished in ${turn} turns`);
      break;
    }

    let action = robot(state);
    state = state.move(action.direction);
    memory = action.memory;

    console.log(`Moved to ${action.direction}`);
  }
}

runRobot(VillageState.random(), randomRobot);
