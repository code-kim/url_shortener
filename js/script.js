"use strict";

const form = document.querySelector(".url-shortener");
const urlInput = document.querySelector(".url-input");
const urlShortenBtn = document.querySelector(".url-shorten-btn");
const shortenedUrlsContainer = document.querySelector(
	".shortened-urls-container"
);
const errorMsg = document.querySelector(".error-msg");
const accessToken = "9bb7b5d4b8a1dd5c492df88dd390436060dfc3a4";
const apiUrl = "https://api-ssl.bitly.com/v4/shorten";
const hamBurger = document.querySelector(".hamburger");
const menu = document.querySelector(".nav-links-buttons-container");

// HELPER FUNCTIONS
const displayError = function () {
	urlInput.classList.add("error");
	urlInput.style.setProperty("--placeholder", "hsl(0, 87%, 67%)");
	errorMsg.classList.remove("hidden");
};

const removeError = function () {
	urlInput.classList.remove("error");
	urlInput.style.setProperty("--placeholder", "hsl(257, 7%, 63%)");
	errorMsg.classList.add("hidden");
};

const copyText = function () {
	// get shortened link
	const shortLink = document.querySelector(".shortened-link");

	// copy shortened link to clipboard
	navigator.clipboard.writeText(shortLink.textContent).then(() => {
		// style button and change text content
		const copyBtn = document.querySelector(".copy");
		copyBtn.textContent = "Copied!";
		copyBtn.style.backgroundColor = "hsl(260, 8%, 14%)";
	});
};

// URL SHORTENER
const formSubmit = async (e) => {
	e.preventDefault();
	let originalLink = "";

	if (urlInput.value.length > 31) {
		originalLink = `${urlInput.value.substring(0, 30)}...`;
	} else {
		originalLink = urlInput.value;
	}
	// add error if no text was entered, remove error if text is entered afterwards
	if (urlInput.value != "") removeError();
	if (urlInput.value === "") return displayError();

	try {
		// code from bitly api docs to shorten the original link
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				long_url: originalLink,
				domain: "bit.ly",
			}),
		});
		// get the data from the response
		const data = await response.json();

		// create new list element and prepend it to the list to display shortened links
		let shortenedUrlContainer = document.createElement("li");
		shortenedUrlContainer.className = "shortened-url-container";
		shortenedUrlContainer.innerHTML = `<span class="original-link">${originalLink}</span>

  <div class="shortened-link-container">
    <a href="${data.link}" target="_blank" class="shortened-link">${data.link}</a
    ><button class="btn copy">copy</button>
  </div>`;
		shortenedUrlsContainer.prepend(shortenedUrlContainer);
	} catch (err) {
		console.error(err);
	}
	// set value back to empty after original link was submitted
	urlInput.value = "";
};

form.addEventListener("submit", formSubmit);

// COPY SHORTENED URL
document.addEventListener("click", function (e) {
	if (e.target.classList.contains("copy")) copyText();
});

//HAMBURGER MENU
hamBurger.addEventListener("click", function (e) {
	e.preventDefault();
	if (menu.style.display === "flex") {
		menu.style.display = "";
	} else {
		menu.style.display = "flex";
	}
});
