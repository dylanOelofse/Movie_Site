const url = new URL(location.href);
const movieId = url.searchParams.get("id");
const movieTitle = url.searchParams.get("title");
const movieImage = url.searchParams.get("image");

let APILINK = '';

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Running locally (localhost OR 127.0.0.1)
  APILINK = 'http://localhost:8000/api/v1/reviews/';
} else {
  // In production (on Render etc)
  APILINK = window.location.origin + '/api/v1/reviews/';
}

const main = document.getElementById("section");
const main2 = document.getElementById("section2");
const title = document.getElementById("title");
const image = document.getElementById("image");
let currentEditingId = null;

title.innerText = movieTitle;
image.src = movieImage;

function storeSearchQuery() {
    const searchQuery = sessionStorage.getItem('searchQuery'); 
    if (searchQuery) {
        sessionStorage.setItem('previousSearch', searchQuery); 
    }
}

const div_new = document.createElement('div');
div_new.innerHTML = `
    <div class="row">
        <div class="column">
            <div class="all-cards">
                <div class="card">
                  <p class="newReviewTitle">New Review</p>

                  <p class="inputTitles">User:</p>
                  <form class="newUserForm">
                    <input type="text" id="new_user" value="" maxlength="14" required autocomplete="off">
                  </form>

                  <p class="inputTitles">Review:</p>
                  <form class="newReviewForm">
                    <textarea id="new_review" wrap="soft" required></textarea>
                  </form>

                  <div class="interact-buttons">
                    <p><a href="#" class="saveButton" onclick="saveReview('new_review', 'new_user')">💾</a>
                    </p>
                  </div>
              </div>
            </div>
        </div>
    </div>
`
main.appendChild(div_new);

returnReviews(APILINK);

function returnReviews(url) { 
    fetch(url + "movie/" + movieId)
        .then(res => res.json())
        .then(function(data) {
            console.log(data);
            data.forEach(review => {
                const div_card = document.createElement('div');
                div_card.innerHTML = `
                    <div class="row">
                        <div class="column">
                            <div class="all-cards">
                              <div class="card" id="${review._id}">
                                  <div class="userBlock">  
                                    <p class="reviewUser"><strong>${review.user}</strong></p>
                                  </div>
                                  <div class="reviewBlock">
                                    <p class="review">${review.review}</p>
                                  </div>
                                  <div class="interact-buttons">
                                    <p>
                                      <button type="button" class="editButton" onclick="editReview('${review._id}','${escapeForOnClick(review.review)}', '${escapeForOnClick(review.user)}')">✏️</button> 
                                      <button type="button" class="deleteButton" onclick="deleteReview('${review._id}')">🗑️</button>
                                    </p>
                                  </div>
                              </div>
                            </div>
                        </div>
                    </div>       
                `               
                main2.prepend(div_card); 
            });
          adjustPadding();
          controlReviewScroll();
        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
        });
}

function editReview(id, review, user) {
  if (currentEditingId !== null) {
    showDialog("You are already editing a review. Please save or cancel before editing another.");
    return;
  }

  const element = document.getElementById(id);
  const originalHTML = element.innerHTML;  //store the orignal card

  element.dataset.original = originalHTML;  // Save original HTML in the element's dataset

  const reviewInputId = "review" + id;
  const userInputId = "user" + id;

  element.innerHTML = `
      <p class="newReviewTitle">Edit Review</p>

      <p class="inputTitles">User:</p>
      <form class="newUserForm">
          <input class="editReviewUser" type="text" id="${userInputId}" value="${user}">
      </form>

      <p class="inputTitles">Review:</p>
      <form class="newReviewForm">
          <textarea class="editReviewText" id="${reviewInputId}">${review}</textarea>
      </form>

      <div class="interact-buttons">
          <p>
            <button type="button" class="edit-backArrow" onclick="cancelEdit('${id}')"><i class="fas fa-arrow-left"></i></button>
            <button type="button" class="saveButton" onclick="saveReview('${reviewInputId}', '${userInputId}', '${id}')">💾</button>
          </p>
      </div>
  `;

  currentEditingId = id;
}

function saveReview(reviewInputId, userInputId, id = "") {
  const review = document.getElementById(reviewInputId).value.trim();
  const user = document.getElementById(userInputId).value.trim();

  if (user === '' || review === '') {
    showDialog(`"User" and "Review" fields cannot be empty.`);
    return;
  }

  if (id) {
    showConfirmation("Are you sure you want to save changes?", () => {
      fetch(APILINK + id, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user: user, review: review })
      })
      .then(res => res.json())
      .then(res => {
        console.log(res);
        currentEditingId = null; 
        location.reload();
      });
    });
  } else {
    fetch(APILINK + "new", {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: user, review: review, movieId: movieId })
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      location.reload();
    });
  }

  currentEditingId = null;
}
  
function deleteReview(id) {
  if (currentEditingId !== null) {
    showDialog("You are editing a review. Please save or cancel before deleting another review.");
    return;
  }

  showConfirmation("Are you sure you want to delete this review?", () => {
    fetch(APILINK + id, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(res => {
      console.log(res);
      location.reload();
    });
  });
}


function adjustPadding() {
  const nav = document.querySelector('.topnav');
  const allCardsList = document.querySelectorAll('.all-cards');

  if (nav && allCardsList.length > 0) {
      const navHeight = nav.offsetHeight;

      allCardsList.forEach(card => {
          card.style.paddingTop = '0px';
      });

      // Check screen size and adjust the number of cards based on it
      if (window.matchMedia('(max-width: 768px)').matches) {
        // For screens <= 768px, add padding to the first 2 items
        for (let i = 0; i < 2 && i < allCardsList.length; i++) {
          allCardsList[i].style.paddingTop = `${navHeight}px`;
        }
      } else if (window.matchMedia('(max-width: 1024px)').matches) {
        // For screens <= 1024px, add padding to the first 3 items
        for (let i = 0; i < 3 && i < allCardsList.length; i++) {
          allCardsList[i].style.paddingTop = `${navHeight}px`;
        }
      } else {
        // For larger screens, add padding to the first 4 items
        for (let i = 0; i < 5 && i < allCardsList.length; i++) {
          allCardsList[i].style.paddingTop = `${navHeight}px`;
        }
      }
  }
}

window.addEventListener('DOMContentLoaded', adjustPadding);
window.addEventListener('resize', adjustPadding);
window.addEventListener('load', adjustPadding);

function controlReviewScroll() {
  const reviewBlocks = document.querySelectorAll('.reviewBlock');

  reviewBlocks.forEach(block => {
    const review = block.querySelector('.review');
    if (!review) return;

    const blockHeight = block.clientHeight;
    const reviewHeight = review.scrollHeight;

    if (reviewHeight > blockHeight) {
      block.style.overflowY = 'auto'; 
    } else {
      block.style.overflowY = 'hidden';
    }
  });
}

function escapeForOnClick(text) {
  return text
    .replace(/\\/g, '\\\\')   // escape backslashes first
    .replace(/'/g, "\\'")     // escape single quotes
    .replace(/\n/g, "\\n")    // escape newlines
    .replace(/\r/g, "\\r");   // escape carriage returns
}

function cancelEdit(id) {
  const element = document.getElementById(id);
  const originalHTML = element.dataset.original;

  if (originalHTML) {
    element.innerHTML = originalHTML;
    currentEditingId = null;
  }
}

function showDialog(message) {
  const dialog = document.getElementById("customDialog");
  const dialogMessage = document.getElementById("dialogMessage");
  dialogMessage.innerText = message;
  dialog.classList.remove("dialog-hidden");
}

function closeDialog() {
  const dialog = document.getElementById("customDialog");
  dialog.classList.add("dialog-hidden");
}

let confirmAction = null;

function showConfirmation(message, onConfirm) {
  const dialog = document.getElementById("confirmationDialog");
  const messageEl = document.getElementById("confirmationMessage");

  messageEl.innerText = message;
  confirmAction = onConfirm;
  dialog.classList.remove("dialog-hidden");
}

function confirmDialog(confirmed) {
  const dialog = document.getElementById("confirmationDialog");
  dialog.classList.add("dialog-hidden");

  if (confirmed && typeof confirmAction === "function") {
    confirmAction();
  }

  confirmAction = null;
}
