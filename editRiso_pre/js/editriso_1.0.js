// prepare colors by importing RISOCOLORS from p5.riso
const risoColors = [];
for (const {name} of RISOCOLORS) {
  risoColors.push(name);
}

let inkslot = {
  A: 'BLUE',
  B: 'RED',
  C: 'YELLOW',
  D: 'BLACK'
}

const formats = {
  a5: {
    name: 'A5',
    width: 1748,
    height: 2480,
    printWidth: 148,
    printHeight: 210
  },
  postcard: {
    name: 'Post Card',
    width: 1181,
    height: 1748,
    printWidth: 105,
    printHeight: 148
  },
  cd: {
    name: 'CD Jacket',
    width: 1417,
    height: 1417,
    printWidth: 120,
    printHeight: 120
  }
}

function setup() {
  // Toolbar
}
