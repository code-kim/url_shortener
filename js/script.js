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
const clearBtn = document.querySelector(".clear-btn");
const statisticsTitle = document.querySelector(".statistics-title");

const ids = [];
let shortenedUrlsArray = [];
let visibleOriginalLink;
let originalLink;
let data;
let localData;
let shortenedUrlContainer;
//let closeUrlContainer;

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

// PUT HTTPS AT FRONT OF URL IN CASE USER ENTERS URL MANUALLY & GET RID OF ANY
// SPACES
const fixUrl = (url) => {
	let noSpaces = url.replaceAll(/\s/g, "");
	return noSpaces.slice(0, 8) !== "https://" ? `https://${noSpaces}` : noSpaces;
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

//CREATE OBJECT WITH FORM DATA FOR LOCAL STORAGE
const createObject = (data) => {
	return {
		visibleOriginalLink: visibleOriginalLink,
		shortenedLink: data.link,
		id: shortenedUrlContainer.dataset.id,
	};
};

//SET DATA-ID FOR EACH URL CONTAINER IN LIST

const setId = (urlContainer) => {
	let randomNum = Math.floor(Math.random() * 100);
	if (!ids.includes(randomNum)) {
		urlContainer.setAttribute("data-id", randomNum);
	}

	ids.push(+urlContainer.dataset.id);
};

// SET LOCAL STORAGE

const setLocalStorage = (links) => {
	localStorage.setItem("links", JSON.stringify(links));
};

//GET LOCAL STORAGE
const getLocalStorage = () => {
	localData = JSON.parse(localStorage.getItem("links"));

	if (!localData) return;

	shortenedUrlsArray = localData;
	//console.log(shortenedUrlsArray);
	shortenedUrlsArray.forEach((url) => {
		//console.log(url);
		renderUrlContainer(url.shortenedLink, url.visibleOriginalLink);
		//console.log(url.shortenedLink, url.visibleOriginalLink);
	});
};

const clearData = () => {
	// clear storage
	localStorage.clear();
	//clear urls array
	shortenedUrlsArray = [];
	// clear rendered list elements and hide clear btn
	shortenedUrlsContainer.innerHTML = "";
	clearBtn.classList.add("hidden");
	// add top padding back to 15rem on statistics title
	statisticsTitle.style.paddingTop = "15rem";
};

// create new list element and prepend it to the list to display shortened links
const renderUrlContainer = (shortLink, longLink) => {
	// show clear button
	clearBtn.classList.remove("hidden");
	// reduce padding on statistics-title
	statisticsTitle.style.paddingTop = "10rem";

	shortenedUrlContainer = document.createElement("li");
	shortenedUrlContainer.className = "shortened-url-container";

	shortenedUrlContainer.innerHTML = `<p class="original-link">${longLink}</p>

<div class="shortened-link-container">
<a href="${shortLink}" target="_blank" class="shortened-link">${shortLink}</a
><button class="btn copy">copy</button>

</div>
<ion-icon name="close-outline" class="close-shortened-url"></ion-icon>`;
	shortenedUrlsContainer.prepend(shortenedUrlContainer);
	setId(shortenedUrlContainer);
};

// URL SHORTENER
const formSubmit = async (e) => {
	e.preventDefault();
	// add error if no text was entered, remove error if text is entered afterwards
	if (urlInput.value != "") removeError();
	if (urlInput.value === "") return displayError();
	//add https:// if missing
	originalLink = fixUrl(urlInput.value);
	visibleOriginalLink = fixUrl(urlInput.value);
	// shorten original url if too long
	if (urlInput.value.length > 31) {
		visibleOriginalLink = `${originalLink.substring(0, 30)}...`;
	} else {
		visibleOriginalLink = originalLink;
	}
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
		data = await response.json();
		//check to see if there is already the same url
		if (shortenedUrlsArray.every((obj, i) => obj.shortenedLink !== data.link)) {
			//render urlContainer
			renderUrlContainer(data.link, visibleOriginalLink);

			//create data object
			let obj = createObject(data);

			//add to array
			shortenedUrlsArray.push(obj);
			setLocalStorage(shortenedUrlsArray);
		}
		//console.log(shortenedUrlsArray);
	} catch (err) {
		console.error(err);
	}
	// set value back to empty after original link was submitted
	urlInput.value = "";
};

form.addEventListener("submit", formSubmit);

//set local storage
//setLocalStorage(shortenedUrlsArray);

//call get local storage
getLocalStorage(data);

// COPY SHORTENED URL
document.addEventListener("click", function (e) {
	if (e.target.classList.contains("copy")) copyText();
});

//CLEAR LOCAL STORAGE
clearBtn.addEventListener("click", clearData);

//CLOSE SHORTENED URL CONTAINER
shortenedUrlsContainer.addEventListener("click", function (e) {
	e.preventDefault();

	if (e.target.classList.value.includes("close-shortened-url")) {
		let id = e.target.parentNode.dataset.id;
		//delete url container
		e.target.parentNode.remove();
		//delete url from array
		shortenedUrlsArray.forEach((obj, i) => {
			if (obj.id === id) {
				shortenedUrlsArray.splice(i, 1);
				// update local storage
				setLocalStorage(shortenedUrlsArray);
			}
		});
	}

	//remove clear button when there are no url list elements
	clearBtn.classList.add("hidden");
	statisticsTitle.style.paddingTop = "15rem";
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
