'use strict';
const reviews = document.querySelector('.reviews');
let activeElem = reviews.querySelector('.reviews__country-btn--active');
let reviewsList = reviews.querySelector('.reviews__list');

console.log('---', 'Hello World!')
// const API_URL = 'http://localhost:3000/api';
const API_URL = 'https://e-melnichenko.github.io/SwedishBitter/api';

const getReviews = async(fileName) => {
  let response = await fetch(`${API_URL}/${fileName}.json`);
  return response.json();
};

let state = {
  reviews: [],
  isReviewsRus: true,
};

function setState(data) {
  state = {
    ...state,
    ...data
  };

  methods.render();
}

const methods = {
  render() {
    reviewsList.innerHTML = `
      ${state.reviews.map(review => `
        <li class="reviews__list-item">
          <p class="reviews__text">${review.text}</p>
          <p class="reviews__author">${review.author}</p>
        </li>
      `).join('')}
    `
  },

  loadReviews(fileName) {
    getReviews(fileName)
      .then(reviews => {
        setState({ reviews })
    });
  }
}

methods.loadReviews('reviews-rus');


reviews.addEventListener('click', (event) => {
  event.preventDefault();

  const delegateTarget = event.target.closest('[data-element=country-btn');
  if(!delegateTarget || delegateTarget.classList.contains('reviews__country-btn--active')) return;

  if(state.isReviewsRus) {
    methods.loadReviews('reviews-abroad');
  } else {
    methods.loadReviews('reviews-rus');
  }
  state.isReviewsRus = !state.isReviewsRus;
  activeElem.classList.remove('reviews__country-btn--active');
  delegateTarget.classList.add('reviews__country-btn--active');
  activeElem = delegateTarget;
});
