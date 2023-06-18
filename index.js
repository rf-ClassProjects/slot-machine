class Input {
  static keysPressed = {};
  static keysPressedPending = {};
  static lastKeyPressed = "";

  static init() {
    window.addEventListener("keydown", (event) => {
      if (event.key in Input.keysPressed) {
        return;
      }
      Input.keysPressed[event.key] = true;
      Input.keysPressedPending[event.key] = true;
      Input.lastKeyPressed = event.key;
    });

    window.addEventListener("keyup", (event) => {
      delete Input.keysPressed[event.key];
      // delete Input.keysPressedPending[event.key];
    });
  }

  static clearPendingInputs() {
    Input.keysPressedPending = {};
  }

  static getKey(key) {
    return Input.keysPressed[key];
  }

  static getKeyDown(...keys) {
    for (let key of keys) {
      if (key in Input.keysPressedPending) {
        delete Input.keysPressedPending[key];
        return key;
      }
    }
    return false;
  }

  static anyKeyDown() {
    return Object.keys(Input.keysPressedPending).length > 0;
  }

  static getKeyDicts() {
    return `Keys Pressed: ${JSON.stringify(Input.keysPressed)}\nKeys Pressed Pending: ${JSON.stringify(Input.keysPressedPending)}\nLast Key Pressed: ${Input.lastKeyPressed}`;
  }
}

/*
& $ #
$ # &
# & $
- - -
8 8 8
- - -
# & $
$ # &
& $ #
W W W
*/

let wheel1 = ["&", "$", "#", "-", "8", "-", "#", "$", "&", "W"];
let wheel2 = ["$", "#", "&", "-", "8", "-", "&", "#", "$", "W"];
let wheel3 = ["#", "&", "$", "-", "8", "-", "$", "&", "#", "W"];
let idx1 = 0;
let idx2 = 0;
let idx3 = 0;
let wheel1Spinning = false;
let wheel2Spinning = false;

let currentCredits = 1000;
let creditsPutIn = currentCredits;
let betAmount = 100;

function until(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 100);
  };
  return new Promise(poll);
}

function timer(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`Finished waiting ${timeout}ms`);
    }, timeout);
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function turnGray() {
  return `\u001b[38;2;94;94;94m`;
}

function turnDarkGray() {
  return `\u001b[38;2;50;50;50m`;
}

function resetColor() {
  return "\u001b[0m";
}

let handleAnim = [
  ["◯", "", "", "", ""],
  ["│", "◯", "", "", ""],
  ["┘", "┘", "◯", "┐", "┐"],
  ["", "", "", "◯", "│"],
  ["", "", "", "", "◯"],
];
let animTime = 0;

async function animateHandle(reverse = false) {
  if (reverse) {
    while (animTime > 0) {
      await timer(100);
      animTime--;
    }
  } else {
    while (animTime < 4) {
      await timer(100);
      animTime++;
    }
  }
}

function printSlotMachine() {
  console.clear();
  slotMachine = `Current Bet: ${betAmount}\n`;
  slotMachine += "  ╭─────╮  \n┌─┴─────┴─┐\n";
  slotMachine += `│ ${turnDarkGray()}┌─┬─┬─┐${resetColor()} │ ${handleAnim[0][animTime]}\n`;
  slotMachine += `│ ${turnGray()}│${wheel1[(idx1 - 1 + wheel1.length) % wheel1.length]}│${wheel2[(idx2 - 1 + wheel1.length) % wheel2.length]}│${wheel3[(idx3 - 1 + wheel1.length) % wheel3.length]}│${resetColor()} ├┐${handleAnim[1][animTime]}\n`;
  slotMachine += `│[│${wheel1[idx1]}│${wheel2[idx2]}│${wheel3[idx3]}│]│├${handleAnim[2][animTime]}\n`;
  slotMachine += `│ ${turnGray()}│${wheel1[(idx1 + 1) % wheel1.length]}│${wheel2[(idx2 + 1) % wheel2.length]}│${wheel3[(idx3 + 1) % wheel3.length]}│${resetColor()} ├┘${handleAnim[3][animTime]}\n`;
  slotMachine += `│ ${turnDarkGray()}└─┴─┴─┘${resetColor()} │ ${handleAnim[4][animTime]}\n`;
  slotMachine += "└─────────┘";
  console.log(slotMachine);
}

function spinWheel() {
  if (wheel1Spinning) idx1 = (idx1 - 1 + wheel1.length) % wheel1.length;
  if (wheel2Spinning) idx2 = (idx2 - 1 + wheel2.length) % wheel2.length;
  idx3 = (idx3 - 1 + wheel3.length) % wheel3.length;
  printSlotMachine();
}

function mode(arr) {
  return arr.sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length).pop();
}

function symbolsAreEqual(a, b) {
  return a === b || a === "W" || b === "W";
}

function allUnique(arr) {
  return arr.length === new Set(arr).size;
}

function allEqual(arr) {
  return arr.every((val) => val === arr[0]);
}

function calculateWinnings() {
  symbols = [wheel1[idx1], wheel2[idx2], wheel3[idx3]];
  if (allUnique(symbols)) {
    if (symbols.includes("W")) {
      console.log("You made back your bet!");
      return betAmount;
    }
    return 0;
  }
  winningSymbol = mode(symbols);
  switch (winningSymbol) {
    case "-":
      if (allEqual(symbols)) {
        console.log("Oh No! You lost all of your credits!");
        return -currentCredits;
      }
      return 0;
    case "#":
    case "&":
    case "$":
      if (allEqual(symbols)) {
        console.log("You got 4 times your bet!!");
        return betAmount * 4;
      }
      if (symbolsAreEqual(symbols[0], symbols[1])) {
        console.log("You got triple your bet!!");
        return betAmount * 3;
      }
      console.log("You made back your bet!");
      return betAmount;
    case "8":
      if (symbolsAreEqual(symbols[0], symbols[1])) {
        console.log("You got 8 times your bet!!!");
        return betAmount * 8;
      }
      console.log("You made back your bet!");
      return betAmount;
    case "W":
      if (allEqual(symbols)) {
        console.log("You got 4 times your bet!!");
        return betAmount * 4;
      }
      if (symbols[0] === "8") {
        console.log("You got 6 times your bet!!!");
        return betAmount * 6;
      }
      if (symbols[0] === "-") {
        console.log("You made back your bet!");
        return betAmount;
      }
      console.log("You got triple your bet!!");
      return betAmount * 3;
  }
}

async function main() {
  Input.init();
  while (true) {
    let cashingOut = false;

    if (currentCredits < 10) {
      console.log("Uh-oh, looks like you don't have enough credits to spin.\n\n'Press ENTER to add 500 more credits, or BACKSPACE to cash out.'");
      await until((_) => (keyPressed = Input.getKeyDown("Enter", "Backspace")));
      if (keyPressed === "Enter") {
        currentCredits += 500;
        creditsPutIn += 500;
      } else cashingOut = true;
    }

    betAmount = Math.min(betAmount, currentCredits);

    while (!cashingOut) {
      // < Get bet from player >
      console.clear();
      // console.log(`${Input.getKeyDicts()}\n\n`);
      console.log(`Current Credits: ${currentCredits}\nAmount to Bet: ${betAmount}\n\nUse the ARROW KEYS to increase or decrease your bet.\nPress ENTER to Continue!\nOr press BACKSPACE to cash out.`);

      await until((_) => (keyPressed = Input.getKeyDown("ArrowUp", "ArrowDown", "Enter", "Backspace")));
      if (keyPressed === "ArrowUp") {
        if (betAmount + 10 > currentCredits) {
          betAmount = currentCredits;
          continue;
        }
        betAmount += 10;
      } else if (keyPressed === "ArrowDown") {
        if (betAmount - 10 < 10) {
          betAmount = 10;
          continue;
        }
        betAmount -= 10;
      } else if (keyPressed === "Enter") {
        currentCredits -= betAmount;
        Input.clearPendingInputs();
        break;
      } else {
        cashingOut = true;
        Input.clearPendingInputs();
        break;
      }
    }

    if (cashingOut) {
      console.clear();
      console.log(`You made it out with ${currentCredits} credits. (Credits put in: ${creditsPutIn})`);
      break;
    }

    idx1 = getRandomInt(wheel1.length);
    idx2 = getRandomInt(wheel2.length);
    idx3 = getRandomInt(wheel3.length);

    printSlotMachine();
    console.log("Press ENTER to Spin!");

    await until((_) => Input.getKeyDown("Enter"));
    Input.clearPendingInputs();

    animateHandle();

    wheel1Spinning = true;
    wheel2Spinning = true;

    spinWheel();
    spinInterval = setInterval(spinWheel, 100);

    await timer(500);

    animateHandle((reverse = true));

    await timer(getRandomRange(2500, 3100));
    wheel1Spinning = false;
    await timer(getRandomRange(1200, 1800));
    wheel2Spinning = false;
    await timer(getRandomRange(1200, 1800));
    clearInterval(spinInterval);

    currentCredits += calculateWinnings();

    console.log("Press ENTER to continue.");
    await until((_) => Input.getKeyDown("Enter"));
  }
}

main();
