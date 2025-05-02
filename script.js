document.addEventListener("DOMContentLoaded", init);

function init() {
  const ranks = [
    { value: "A", rank: 1 },
    { value: "2", rank: 2 },
    { value: "3", rank: 3 },
    { value: "4", rank: 4 },
    { value: "5", rank: 5 },
    { value: "6", rank: 6 },
    { value: "7", rank: 7 },
    { value: "8", rank: 8 },
    { value: "9", rank: 9 },
    { value: "10", rank: 10 },
    { value: "J", rank: 11 },
    { value: "Q", rank: 12 },
    { value: "K", rank: 13 }
  ];
  const suits = ["♠", "♥", "♦", "♣"];

  // Create card data and shuffle using Fisher–Yates
  const cardData = ranks.map((rankInfo, index) => ({
    value: rankInfo.value,
    suit: suits[index % suits.length],
    rank: rankInfo.rank,
  }));
  console.log(cardData);
  shuffleArray(cardData);

  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  window.cards = [];
  cardData.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("data-value", card.value);
    cardEl.setAttribute("data-suit", card.suit);
    cardEl.innerHTML = `<span>${card.suit}</span>`;
    cardContainer.appendChild(cardEl);
    window.cards.push({ element: cardEl, rank: card.rank });
  });

  // Initially stack cards as a deck (centered)
  setCardsAsDeck();
  // Animate cards to their positions after 1 second
  setTimeout(updateCardPositions, 1000);

  // Control Elements
  const shuffleBtn = document.getElementById("shuffle-button");
  const startBtn = document.getElementById("start-button");
  const algoSelect = document.getElementById("algo");
  const speedSlider = document.getElementById("speed");
  const speedValue = document.getElementById("speed-value");

  // New slider setup: update the display value on input
  speedSlider.addEventListener("input", function () {
    speedValue.textContent = speedSlider.value;
  });

  shuffleBtn.addEventListener("click", shuffleCards);

  startBtn.addEventListener("click", async () => {
    if (areCardsSorted()) {
      shuffleCards();
      await delay(600);
    }
    document.getElementById("congratulations-message").style.display = "none";
    startBtn.disabled = true;
    shuffleBtn.disabled = true;
    const algo = algoSelect.value;
    if (algo === "bubble") {
      await bubbleSort();
    } else if (algo === "selection") {
      await selectionSort();
    } else if (algo === "insertion") {
      await insertionSort();
    } else if (algo === "quick") {
      await quickSortMain();
    }
    startBtn.disabled = false;
    shuffleBtn.disabled = false;
  });

  window.addEventListener("resize", updateCardPositions);
}

// ----------------- Sorting Algorithms -----------------

// Bubble Sort
async function bubbleSort() {
  const cards = window.cards;
  const len = cards.length;
  let i = 0, j = 0;
  return new Promise((resolve) => {
    function step() {
      if (i < len) {
        if (j < len - i - 1) {
          const cardA = cards[j];
          const cardB = cards[j + 1];
          cardA.element.classList.add("active");
          cardB.element.classList.add("active");
          setTimeout(() => {
            if (cardA.rank > cardB.rank) {
              cardA.element.classList.add("flip");
              cardB.element.classList.add("flip");
              [cards[j], cards[j + 1]] = [cards[j + 1], cards[j]];
              const swapSound = document.getElementById("swap-sound");
              if (swapSound) {
                swapSound.currentTime = 0;
                swapSound.play();
              }
              updateCardPositions();
              setTimeout(() => {
                cardA.element.classList.remove("flip");
                cardB.element.classList.remove("flip");
              }, 600);
            }
            cardA.element.classList.remove("active");
            cardB.element.classList.remove("active");
            j++;
            setTimeout(step, getDelay());
          }, getDelay());
        } else {
          cards[len - i - 1].element.classList.add("sorted");
          const placedSound = document.getElementById("placed-sound");
          if (placedSound) {
            placedSound.currentTime = 0;
            placedSound.play();
          }
          j = 0;
          i++;
          setTimeout(step, getDelay());
        }
      } else {
        cards.forEach((cardObj) => cardObj.element.classList.add("sorted"));
        const winMusic = document.getElementById("win-music");
        if (winMusic) winMusic.play();
        showCongratulations("Time Complexity: O(N²)");
        resolve();
      }
    }
    step();
  });
}

// Selection Sort
async function selectionSort() {
  const cards = window.cards;
  const len = cards.length;
  return new Promise((resolve) => {
    let i = 0;
    function outerLoop() {
      if (i < len) {
        let minIndex = i;
        let j = i + 1;
        function innerLoop() {
          if (j < len) {
            cards[j].element.classList.add("active");
            cards[minIndex].element.classList.add("active");
            setTimeout(() => {
              cards[j].element.classList.remove("active");
              cards[minIndex].element.classList.remove("active");
              if (cards[j].rank < cards[minIndex].rank) {
                minIndex = j;
              }
              j++;
              setTimeout(innerLoop, getDelay());
            }, getDelay());
          } else {
            if (minIndex !== i) {
              cards[i].element.classList.add("flip");
              cards[minIndex].element.classList.add("flip");
              [cards[i], cards[minIndex]] = [cards[minIndex], cards[i]];
              const swapSound = document.getElementById("swap-sound");
              if (swapSound) {
                swapSound.currentTime = 0;
                swapSound.play();
              }
              updateCardPositions();
              setTimeout(() => {
                cards[i].element.classList.remove("flip");
                cards[minIndex].element.classList.remove("flip");
                cards[i].element.classList.add("sorted");
                const placedSound = document.getElementById("placed-sound");
                if (placedSound) {
                  placedSound.currentTime = 0;
                  placedSound.play();
                }
                i++;
                setTimeout(outerLoop, getDelay());
              }, 600);
            } else {
              cards[i].element.classList.add("sorted");
              const placedSound = document.getElementById("placed-sound");
              if (placedSound) {
                placedSound.currentTime = 0;
                placedSound.play();
              }
              i++;
              setTimeout(outerLoop, getDelay());
            }
          }
        }
        innerLoop();
      } else {
        cards.forEach((cardObj) => cardObj.element.classList.add("sorted"));
        const winMusic = document.getElementById("win-music");
        if (winMusic) winMusic.play();
        showCongratulations("Time Complexity: O(N²)");
        resolve();
      }
    }
    outerLoop();
  });
}

// Insertion Sort
async function insertionSort() {
  const cards = window.cards;
  const len = cards.length;
  return new Promise((resolve) => {
    let i = 1;
    function outerLoop() {
      if (i < len) {
        let j = i;
        function innerLoop() {
          if (j > 0 && cards[j].rank < cards[j - 1].rank) {
            cards[j].element.classList.add("active");
            cards[j - 1].element.classList.add("active");
            setTimeout(() => {
              cards[j].element.classList.remove("active");
              cards[j - 1].element.classList.remove("active");
              cards[j].element.classList.add("flip");
              cards[j - 1].element.classList.add("flip");
              [cards[j], cards[j - 1]] = [cards[j - 1], cards[j]];
              const swapSound = document.getElementById("swap-sound");
              if (swapSound) {
                swapSound.currentTime = 0;
                swapSound.play();
              }
              updateCardPositions();
              setTimeout(() => {
                cards[j].element.classList.remove("flip");
                cards[j - 1].element.classList.remove("flip");
                j--;
                setTimeout(innerLoop, getDelay());
              }, 600);
            }, getDelay());
          } else {
            i++;
            setTimeout(outerLoop, getDelay());
          }
        }
        innerLoop();
      } else {
        cards.forEach((cardObj) => cardObj.element.classList.add("sorted"));
        const winMusic = document.getElementById("win-music");
        if (winMusic) winMusic.play();
        showCongratulations("Time Complexity: O(N²)");
        resolve();
      }
    }
    outerLoop();
  });
}

// Quick Sort Helpers
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function partition(low, high) {
  const cards = window.cards;
  cards[high].element.classList.add("pivot");
  const pivotValue = cards[high].rank;
  let i = low - 1;
  for (let j = low; j < high; j++) {
    cards[j].element.classList.add("active");
    cards[high].element.classList.add("active");
    await delay(getDelay());
    cards[j].element.classList.remove("active");
    cards[high].element.classList.remove("active");
    if (cards[j].rank < pivotValue) {
      i++;
      cards[i].element.classList.add("flip-quick");
      cards[j].element.classList.add("flip-quick");
      [cards[i], cards[j]] = [cards[j], cards[i]];
      const swapSound = document.getElementById("swap-sound");
      if (swapSound) {
        swapSound.currentTime = 0;
        swapSound.play();
      }
      updateCardPositions();
      await delay(600);
      cards[i].element.classList.remove("flip-quick");
      cards[j].element.classList.remove("flip-quick");
    }
  }
  i++;
  cards[i].element.classList.add("flip-quick");
  cards[high].element.classList.add("flip-quick");
  [cards[i], cards[high]] = [cards[high], cards[i]];
  const swapSound = document.getElementById("swap-sound");
  if (swapSound) {
    swapSound.currentTime = 0;
    swapSound.play();
  }
  updateCardPositions();
  await delay(600);
  cards[i].element.classList.remove("flip-quick");
  cards[high].element.classList.remove("flip-quick");
  cards[i].element.classList.remove("pivot");
  return i;
}

async function quickSort(low, high) {
  if (low < high) {
    const pi = await partition(low, high);
    await quickSort(low, pi - 1);
    await quickSort(pi + 1, high);
  }
}

async function quickSortMain() {
  await quickSort(0, window.cards.length - 1);
  window.cards.forEach((cardObj) => cardObj.element.classList.add("sorted"));
  const winMusic = document.getElementById("win-music");
  if (winMusic) winMusic.play();
  showCongratulations("Time Complexity: O(N log N)");
}

// ----------------- Utility Functions -----------------

function areCardsSorted() {
  return window.cards.every((cardObj) =>
    cardObj.element.classList.contains("sorted")
  );
}

function setCardsAsDeck() {
  const cardContainer = document.getElementById("card-container");
  const cardWidth = window.cards[0].element.offsetWidth;
  const containerWidth = cardContainer.offsetWidth;
  const center = (containerWidth - cardWidth) / 2;
  window.cards.forEach((cardObj) => {
    cardObj.element.style.left = `${center}px`;
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const tempIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[tempIndex]] = [array[tempIndex], array[i]];
  }
}

function updateCardPositions() {
  const cardContainer = document.getElementById("card-container");
  const totalCards = window.cards.length;
  if (!totalCards) return;
  const cardWidth = window.cards[0].element.offsetWidth;
  const gap = 10;
  const containerWidth = cardContainer.offsetWidth;
  const totalRequiredWidth = totalCards * cardWidth + (totalCards - 1) * gap;
  const baseOffset = (containerWidth - totalRequiredWidth) / 2;
  window.cards.forEach((cardObj, index) => {
    const leftPos = baseOffset + index * (cardWidth + gap);
    cardObj.element.style.left = `${leftPos}px`;
  });
}

function shuffleCards() {
  const shuffleSound = document.getElementById("shuffle-sound");
  if (shuffleSound) {
    shuffleSound.currentTime = 0;
    shuffleSound.play();
  }
  shuffleArray(window.cards);
  window.cards.forEach((cardObj) =>
    cardObj.element.classList.remove("sorted")
  );
  updateCardPositions();
  document.getElementById("congratulations-message").style.display = "none";
}

/* 

Mapping slider values (1 to 5) to delay in ms:
  s = 1  → 2400 - 400×1 = 2000 ms (slow)
  s = 2  → 2400 - 400×2 = 1600 ms
  s = 3  → 2400 - 400×3 = 1200 ms
  s = 4  → 2400 - 400×4 = 800 ms
  s = 5  → 2400 - 400×5 = 400 ms (fast)
*/
function getDelay() {
  const s = parseInt(document.getElementById("speed").value, 10); 

  const oldValue = 8 + 0.5 * (s - 1);

  return 100 + (1900 * (10 - oldValue)) / 9;
}


function showCongratulations(message) {
  const msg = document.getElementById("congratulations-message");
  msg.innerHTML = `<h2 style="margin-bottom: 0;">Sorted! ✨</h2>
                   <p>The cards are in perfect order | ${message}</p>`;
  msg.style.display = "block";
}
