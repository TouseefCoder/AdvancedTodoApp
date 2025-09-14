const savedCards = JSON.parse(localStorage.getItem("cards"));
const cards = savedCards || [];

const CardContainer = document.querySelector(".main-details__cards");

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}
const mainDetalsClass = document.getElementById("mainDetailsCard");
const mainDetailstitleName = document.getElementById("title_name");
const mainDetailsSubTitle = document.getElementById("sub-title_name");
const showStatus = document.getElementById("changeStatus");
const crossIcon = document.getElementById("cross__icon");
const Ongoing = document.getElementById("ongoing");
let selectedCard = null;

function displayCards(statusFilter = "") {
  const filterCards = cards.filter((card) => {
    const parentIdCard = card.parentId === "0";
    if (statusFilter) {
      return card.status === statusFilter && parentIdCard;
    } else {
      return parentIdCard;
    }
  });
  CardContainer.innerHTML = "";

  filterCards.forEach((card) => {
    let childCards = cards.filter(
      (child) => child.parentId === String(card.id)
    );
    let childCardLength = childCards.length;

    let completedTasks = childCards.filter(
      (child) => child.status.toLowerCase() === "completed"
    ).length;
    let progressPercentValue =
      childCardLength > 0
        ? Math.round((completedTasks / childCardLength) * 100)
        : 0;

    if (childCardLength > 0 && completedTasks === childCardLength) {
      card.status = "Completed";
      countTasks();
      saveCards();
    }
    const cardElement = document.createElement("div");
    cardElement.className = "main-details__card";
    cardElement.innerHTML = `
      <div class="main-details__card-content">
        <h2>${card.title}</h2>
        <p>${card.descript}</p>
        <div class="main-detail__tasks">
          <p><i class="fa-regular fa-circle-check"></i>${childCardLength} Tasks</p>
        </div>
      </div>
      <div class="main-details__card-progressbar">
        <div class="status">${card.status}</div>
        <div class="circle__progressbar" id="circle__progressbar">
          <span class="progress__value" id="progress__value">0%</span>
        </div>
      </div>
    `;

    const progressValue = cardElement.querySelector(".progress__value");
    const progressBar = cardElement.querySelector(".circle__progressbar");

    const progressBarAnimation = (endValue) => {
      let progressInc = 0;
      const color = "aqua";

      const progress = setInterval(() => {
        progressInc++;
        progressValue.textContent = `${progressInc}%`;
        progressBar.style.background = `conic-gradient(${color} ${
          progressInc * 3.6
        }deg, #ededed 0deg)`;
        if (progressInc >= endValue) {
          clearInterval(progress);
        }
      }, 10);
    };

    progressBarAnimation(progressPercentValue);

    const parentStatus = cardElement.querySelector(".status");
    parentStatus.addEventListener("click", () => {
      selectedCard = card;
      mainDetailstitleName.textContent = card.title;
      mainDetailsSubTitle.textContent = card.descript;
      showStatus.value = card.status;

      showStatus.addEventListener("change", () => {
        if (selectedCard) {
          selectedCard.status = showStatus.value;

          const cardIndex = cards.findIndex(
            (card) => card.id === selectedCard.id
          );
          if (cardIndex !== -1) {
            cards[cardIndex] = selectedCard;
          }

          const parentCard = cards.find(
            (parent) => parent.id === String(selectedCard.parentId)
          );
          if (parentCard) {
            const siblingCards = cards.filter(
              (sibling) => sibling.parentId === String(parentCard.id)
            );
            const siblingCompleted = siblingCards.filter(
              (sibling) => sibling.status.toLowerCase() === "completed"
            ).length;

            if (
              siblingCards.length > 0 &&
              siblingCompleted === siblingCards.length
            ) {
              parentCard.status = "Completed";
              countTasks();
            }
          }

          saveCards();
          mainDetalsClass.style.display = "none";
          CardContainer.style.display = "block";

          countTasks();
          displayCards();
        }
      });

      mainDetalsClass.style.display = "flex";
      CardContainer.style.display = "none";
    });

    cardElement.addEventListener("click", () => {
      selectedCard = card;

      const existingChildContainer = document.querySelector(
        `#childCardDetails-${card.id}`
      );

      if (existingChildContainer) {
        existingChildContainer.style.display =
          existingChildContainer.style.display === "none" ? "block" : "none";
      } else {
        const newChildCardDetails = document.createElement("div");
        newChildCardDetails.id = `childCardDetails-${card.id}`;
        newChildCardDetails.style.display = "block";

        childCards.forEach((child) => {
          const childCardElement = document.createElement("div");
          childCardElement.className = "main-details__card";
          childCardElement.style.maxWidth = "80%";
          childCardElement.innerHTML = `
            <div class="main-details__card-content">
              <h2>${child.title}</h2>
              <p>${child.descript}</p>                
            </div>
            <div class="main-details__card-progressbar">
              <div class="status">${child.status}</div>                
            </div>
          `;

          childCardElement.addEventListener("click", () => {
            selectedCard = child;
            mainDetailstitleName.textContent = child.title;
            mainDetailsSubTitle.textContent = child.descript;
            showStatus.value = child.status;

            showStatus.addEventListener("change", () => {
              if (selectedCard) {
                selectedCard.status = showStatus.value;
                const cardIndex = cards.findIndex(
                  (card) => card.id === selectedCard.id
                );

                // Update Progress and Animate
                completedTasks = childCards.filter(
                  (child) => child.status.toLowerCase() === "completed"
                ).length;
                progressPercentValue =
                  childCardLength > 0
                    ? Math.round((completedTasks / childCardLength) * 100)
                    : 0;

                // Animate updated progress
                progressBarAnimation(progressPercentValue);

                saveCards();
                mainDetalsClass.style.display = "none";
                CardContainer.style.display = "block";
                countTasks();
                displayCards();
              }
            });

            mainDetalsClass.style.display = "flex";
            CardContainer.style.display = "none";
          });

          newChildCardDetails.appendChild(childCardElement);
        });

        cardElement.after(newChildCardDetails);
      }
    });

    CardContainer.appendChild(cardElement);
  });
}

function countStatus(countFilter = "") {
  let filterCount = cards.filter((card) => {
    const parentStatus = card.parentId === "0";
    return countFilter
      ? countFilter === card.status && parentStatus
      : parentStatus;
  });
  return filterCount.length;
}
function countTasks() {
  document.getElementById("ongoing-tasks").innerText = `${
    countStatus("Ongoing") || "add"
  } tasks`;

  document.getElementById("cancelled-tasks").innerText = `${
    countStatus("Cancelled") || "add"
  } tasks`;

  document.getElementById("inprocess-tasks").innerText = `${
    countStatus("Inprocess") || "add"
  } tasks`;

  document.getElementById("completed-tasks").innerText = `${
    countStatus("Completed") || "add"
  } tasks`;
}

countTasks();

const ongoingBtn = document.getElementById("ongoing");
const inprocessBtn = document.getElementById("inprocess");
const completeBtn = document.getElementById("completed");
const cancelBtn = document.getElementById("canceled");

ongoingBtn.addEventListener("click", () => {
  displayCards("Ongoing");
});

inprocessBtn.addEventListener("click", () => {
  displayCards("Inprocess");
});

completeBtn.addEventListener("click", () => {
  displayCards("Completed");
});

cancelBtn.addEventListener("click", () => {
  displayCards("Cancelled");
});

crossIcon.addEventListener("click", () => {
  mainDetalsClass.style.display = "none";
  CardContainer.style.display = "block";
});

displayCards();

const navFooter = document.querySelectorAll(".nav-footer i");
navFooter.forEach((icon) => {
  icon.addEventListener("click", function () {
    navFooter.forEach((icon) => icon.classList.remove("active"));
    if (icon.id !== "clickButton") {
      icon.classList.add("active");
    }
  });
});

let menuIcon = document.getElementById("menu__icon");
menuIcon.style.cursor = "pointer";
let menuCards = document.getElementById("menu-cards");

menuIcon.addEventListener("click", () => {
  if (menuCards.style.display === "block") {
    menuCards.style.display = "none";
  } else {
    menuCards.style.display = "block";
  }
});

// const allClasses = document.querySelectorAll(
//   ".main-details__card-progressbar .circle__progressbar"
// );

// allClasses.forEach((progressValue) => {
//   const progressPercent = progressValue.querySelector(".progress__value");
//   let progressInc = 0;
//   const progressEnd = 90;
//   const color = "red";

//   const progress = setInterval(() => {
//     progressInc++;
//     progressPercent.textContent = `${progressInc}%`;
//     progressValue.style.background = `conic-gradient(${color} ${
//       progressInc * 3.6
//     }deg, #ededed 0deg)`;
//     if (progressInc == progressEnd) {
//       clearInterval(progress);
//     }
//   }, 10);
// });
let dropDownId = document.getElementById("dropDownId");
function dropDown() {
  dropDownId.innerHTML = "";
  let defaultSelector = document.createElement("option");
  defaultSelector.textContent = "Select an Option";
  defaultSelector.value = "0";
  dropDownId.appendChild(defaultSelector);

  const filteredParentId = cards.filter((card) => card.parentId === "0");
  filteredParentId.forEach((card) => {
    let option = document.createElement("option");
    option.textContent = card.title;
    option.value = card.id;
    dropDownId.appendChild(option);
  });
}

dropDown();
let myForm = document.getElementById("form");
myForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = event.target.name.value;
  const descript = event.target.descript.value;
  const status = "Inprocess";
  const parentId = event.target.dropDownId.value;
  let id;
  if (cards.length > 0) {
    id = cards[cards.length - 1].id + 1;
  } else {
    id = 1;
  }
  newCard = { id, title, descript, status, parentId };
  cards.push(newCard);

  dropDown();
  saveCards();
  countTasks();
  displayCards();

  event.target.reset();

  div1.style.display = "block";
  div2.style.display = "none";
});

function showDetails() {}

let clickButton = document.getElementById("clickButton");

clickButton.style.cursor = "pointer";

clickButton.addEventListener("click", function () {
  var div1 = document.getElementById("div1");
  var div2 = document.getElementById("div2");
  var div3 = document.getElementById("div3");

  if (div1.style.display === "none") {
    div1.style.display = "block";
    div2.style.display = "none";
    div3.style.display = "none";
  } else {
    div1.style.display = "none";
    div2.style.display = "block";
    div3.style.display = "none";
  }
});

let backMenu = document.getElementById("form_back");
backMenu.style.cursor = "pointer";

backMenu.addEventListener("click", function () {
  div1.style.display = "block";
  div2.style.display = "none";
});

let calenderBtn = document.getElementById("calenderId");
calenderBtn.addEventListener("click", () => {
  div1.style.display = "none";
  div2.style.display = "none";
  div3.style.display = "block";
});

const todayDate = new Date();
const CurrentDay = todayDate.toLocaleDateString("default", {
  weekday: "long",
});
const currentDate = todayDate.toLocaleDateString("default", {
  day: "numeric",
});

const CurrentMonth = todayDate.toLocaleDateString("default", {
  month: "long",
});

const CurrentYear = todayDate.toLocaleDateString("default", {
  year: "numeric",
});

function updateTime() {
  const todayDate = new Date();
  const fullFormatDate = document.getElementById("calender__current-date");
  // console.log(fullFormatDate);
  fullFormatDate.innerText = `${CurrentDay}, ${currentDate} ${CurrentMonth} ${CurrentYear}`;

  // console.log(currentTime);

  // Update the time on your webpage (for example)
  // document.getElementById("timeDisplay").innerText = currentTime;
}

updateTime();

// Update the time every second (1000 milliseconds)
// setInterval(updateTime, 1000);

// todayDate.getFullYear();
