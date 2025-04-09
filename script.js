let fields = [null, null, null, null, null, null, null, null, null];
let currentTurn = "circle";
let gameOver = false;
let score = { circle: 0, cross: 0 };

function init() {
  render();
}

function render() {
  let container = document.getElementById("container");
  let tableHTML = "<table>";

  for (let row = 0; row < 3; row++) {
    tableHTML += "<tr>";
    for (let col = 0; col < 3; col++) {
      let index = row * 3 + col;
      let symbol = "";

      if (fields[index] === "circle") {
        symbol = generateCircleSVG();
      } else if (fields[index] === "cross") {
        symbol = generateCrossSVG();
      }

      tableHTML += `<td onclick="handleClick(${index}, this)" data-index="${index}">${symbol}</td>`;
    }
    tableHTML += "</tr>";
  }

  tableHTML += "</table>";
  container.innerHTML = tableHTML;
}

function handleClick(index, cell) {
  if (fields[index] || gameOver) return;

  if (currentTurn === "circle") {
    fields[index] = "circle";
    cell.innerHTML = generateCircleSVG();
    currentTurn = "cross";
  } else {
    fields[index] = "cross";
    cell.innerHTML = generateCrossSVG();
    currentTurn = "circle";
  }

  cell.removeAttribute("onclick");

  let winInfo = checkWin();
  if (winInfo) {
    gameOver = true;
    drawWinLine(winInfo);
    score[currentTurn]++;
    updateScoreboard();
  }
}

function updateScoreboard() {
  document.getElementById("scoreboard").innerText = `Kreis: ${score.circle} | Kreuz: ${score.cross}`;
}


// Prüft, ob jemand gewonnen hat
function checkWin() {
  const winPatterns = [
    [0, 1, 2], // Zeilen
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Spalten
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diagonalen
    [2, 4, 6],
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (fields[a] && fields[a] === fields[b] && fields[a] === fields[c]) {
      return pattern; // gibt z.B. [0, 1, 2] zurück
    }
  }

  return null;
}

// Zeichnet eine weiße Linie über die drei Gewinner-Felder
function drawWinLine(pattern) {
  const tdList = document.querySelectorAll("td");
  const positions = pattern.map((i) => tdList[i].getBoundingClientRect());
  const containerRect = document
    .getElementById("container")
    .getBoundingClientRect();

  let startX = positions[0].left + positions[0].width / 2 - containerRect.left;
  let startY = positions[0].top + positions[0].height / 2 - containerRect.top;
  let endX = positions[2].left + positions[2].width / 2 - containerRect.left;
  let endY = positions[2].top + positions[2].height / 2 - containerRect.top;

  // Richtung berechnen
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const normX = dx / length;
  const normY = dy / length;

  // Verlängere die Linie um 50px nach vorne und hinten
  startX -= normX * 50;
  startY -= normY * 50;
  endX += normX * 50;
  endY += normY * 50;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "win-line");
  svg.setAttribute("width", containerRect.width);
  svg.setAttribute("height", containerRect.height);
  svg.setAttribute(
    "style",
    "position: absolute; top: 0; left: 0; pointer-events: none; z-index: 10;"
  );

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", startX);
  line.setAttribute("y2", startY);
  line.setAttribute("stroke", "white");
  line.setAttribute("stroke-width", "5");
  line.setAttribute("stroke-linecap", "round");

  const lineColor = currentTurn === "circle" ? "#00B0EF" : "#FFC000";
  line.setAttribute("stroke", lineColor);
  line.setAttribute("stroke-width", "5");
  line.setAttribute("stroke-linecap", "round");

  const animateX = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate"
  );
  animateX.setAttribute("attributeName", "x2");
  animateX.setAttribute("to", endX);
  animateX.setAttribute("dur", "400ms");
  animateX.setAttribute("fill", "freeze");

  const animateY = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "animate"
  );
  animateY.setAttribute("attributeName", "y2");
  animateY.setAttribute("to", endY);
  animateY.setAttribute("dur", "400ms");
  animateY.setAttribute("fill", "freeze");

  line.appendChild(animateX);
  line.appendChild(animateY);
  svg.appendChild(line);
  document.getElementById("container").appendChild(svg);
}

function generateCircleSVG() {
  return `
  <svg width="70" height="70" viewBox="0 0 70 70">
    <circle
      cx="35"
      cy="35"
      r="30"
      stroke="#00B0EF"
      stroke-width="5"
      fill="none"
      stroke-dasharray="188.4"
      stroke-dashoffset="188.4">
      <animate
        attributeName="stroke-dashoffset"
        from="188.4"
        to="0"
        dur="200ms"
        fill="freeze"
      />
    </circle>
  </svg>
    `;
}

function generateCrossSVG() {
  return `
  <svg width="70" height="70" viewBox="0 0 70 70">
    <line x1="15" y1="15" x2="55" y2="55"
          stroke="#FFC000" stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray="56.57"
          stroke-dashoffset="56.57">
      <animate attributeName="stroke-dashoffset"
               from="56.57" to="0"
               dur="200ms"
               fill="freeze" />
    </line>
    <line x1="55" y1="15" x2="15" y2="55"
          stroke="#FFC000" stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray="56.57"
          stroke-dashoffset="56.57">
      <animate attributeName="stroke-dashoffset"
               from="56.57" to="0"
               dur="200ms"
               begin="200ms"
               fill="freeze" />
    </line>
  </svg>
    `;
}

function resetGame() {
  // Spielfeld und Spielstatus zurücksetzen
  fields = [null, null, null, null, null, null, null, null, null];
  currentTurn = "circle";
  gameOver = false;

  // Gewinnlinie entfernen, falls vorhanden
  document.querySelector(".win-line")?.remove();

  // Spielfeld neu rendern
  render();
}
