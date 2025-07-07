document.addEventListener("DOMContentLoaded", init);

function init() {
  // 13 card ranks
  const ranks = [
    { value: "A", rank: 1 },  { value: "2", rank: 2 },
    { value: "3", rank: 3 },  { value: "4", rank: 4 },
    { value: "5", rank: 5 },  { value: "6", rank: 6 },
    { value: "7", rank: 7 },  { value: "8", rank: 8 },
    { value: "9", rank: 9 },  { value: "10", rank: 10 },
    { value: "J", rank: 11 }, { value: "Q", rank: 12 },
    { value: "K", rank: 13 }
  ];

  // Cycle through these suits
  const suits = ["♠", "♥", "♦", "♣"];

  // Build cardData and shuffle it
  const cardData = ranks.map((rankInfo, idx) => ({
    value: rankInfo.value,
    suit: suits[idx % suits.length],
    rank: rankInfo.rank
  }));
  shuffleArray(cardData);

  // Create DOM cards
  const cardContainer = document.getElementById("card-container");
  cardContainer.innerHTML = "";
  window.cards = [];
  cardData.forEach(c => {
    const cardEl = document.createElement("div");
    cardEl.classList.add("card");
    cardEl.setAttribute("data-value", c.value);
    cardEl.setAttribute("data-suit", c.suit);
    cardEl.innerHTML = `<span>${c.suit}</span>`;
    cardContainer.appendChild(cardEl);
    window.cards.push({ element: cardEl, rank: c.rank });
  });

  // Stack them, then fan out
  setCardsAsDeck();
  setTimeout(updateCardPositions, 1500);

  // Controls
  const shuffleBtn = document.getElementById("shuffle-button");
  const startBtn   = document.getElementById("start-button");
  const algoSelect = document.getElementById("algo");
  const speedSlider= document.getElementById("speed");
  const speedValue = document.getElementById("speed-value");

  speedSlider.addEventListener("input", e => {
    speedValue.textContent = e.target.value;
  });

  shuffleBtn.addEventListener("click", shuffleCards);

  startBtn.addEventListener("click", async () => {
    if (areCardsSorted()) {
      shuffleCards();
      await delay(600);
    }
    document.getElementById("congratulations-message").style.display = "none";
    startBtn.disabled   = true;
    shuffleBtn.disabled = true;

    const algo = algoSelect.value;
    if (algo === "bubble") await bubbleSort();
    else if (algo === "selection") await selectionSort();
    else if (algo === "insertion") await insertionSort();
    else if (algo === "quick")     await quickSortMain();

    startBtn.disabled   = false;
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

  return new Promise(resolve => {
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
        cards.forEach(c => c.element.classList.add("sorted"));
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

  return new Promise(resolve => {
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
        cards.forEach(c => c.element.classList.add("sorted"));
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

  return new Promise(resolve => {
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
        cards.forEach(c => c.element.classList.add("sorted"));
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
  return new Promise(res => setTimeout(res, ms));
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
  window.cards.forEach(c => c.element.classList.add("sorted"));
  const winMusic = document.getElementById("win-music");
  if (winMusic) winMusic.play();
  showCongratulations("Time Complexity: O(N log N)");
}

// ----------------- Utility Functions -----------------

function setCardsAsDeck() {
  const cardContainer = document.getElementById("card-container");
  const cardWidth = window.cards[0].element.offsetWidth;
  const center = (cardContainer.offsetWidth - cardWidth) / 2;
  window.cards.forEach(c => {
    c.element.style.left = `${center}px`;
  });
}

function updateCardPositions() {
  const cardContainer = document.getElementById("card-container");
  const totalCards    = window.cards.length;
  if (!totalCards) return;

  // Mobile: flex reordering
  const isMobile = window.innerWidth <= 480;
  if (isMobile) {
    window.cards.forEach((c, idx) => {
      c.element.style.order = idx;
      c.element.style.left  = 'auto';
      c.element.style.top   = 'auto';
    });
    return;
  }

  // Desktop: absolute positioning
  const cardWidth    = window.cards[0].element.offsetWidth;
  const gap          = 12;
  const totalReq     = totalCards * cardWidth + (totalCards - 1) * gap;
  const baseOffset   = Math.max((cardContainer.offsetWidth - totalReq) / 2, 0);

  window.cards.forEach((c, idx) => {
    const leftPos = baseOffset + idx * (cardWidth + gap);
    c.element.style.left = `${leftPos}px`;
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const tempIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[tempIndex]] = [array[tempIndex], array[i]];
  }
}

function shuffleCards() {
  const shuffleSound = document.getElementById("shuffle-sound");
  if (shuffleSound) {
    shuffleSound.currentTime = 0;
    shuffleSound.play();
  }
  shuffleArray(window.cards);
  window.cards.forEach(c => c.element.classList.remove("sorted"));
  updateCardPositions();
  document.getElementById("congratulations-message").style.display = "none";
}

function areCardsSorted() {
  return window.cards.every(c => c.element.classList.contains("sorted"));
}

function getDelay() {
  const s = parseInt(document.getElementById("speed").value, 10);
  return 2400 - 400 * s;
}

function showCongratulations(message) {
  const msg = document.getElementById("congratulations-message");
  msg.innerHTML = `<h2 style="margin-bottom:0;">Sorted! ✨</h2>
                   <p>The cards are in perfect order | ${message}</p>`;
  msg.style.display = "block";
}
