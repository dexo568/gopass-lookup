const SCHOOLS_JSON = "data/schools.json";
const FIELD_NAME_SCHOOL = 'school';

const PATH_PREFIX = '/gopass-lookup/';

let SCHOOLS_DATA = [];

loadDataFromJSON(SCHOOLS_JSON);

document.addEventListener('click', clickOutsideSearchInput);

window.addEventListener('load', function() {
	let search_field = document.getElementById('search-field');
	search_field.addEventListener('click', showSuggestionList);
	search_field.addEventListener('input', function() {
		loadSuggestedSchools(SCHOOLS_DATA);
	});

	let search_suggestions = document.getElementById('search-suggestions');

	let search_height = search_field.offsetHeight;
	let search_width = search_field.offsetWidth;

	search_suggestions.style.top = search_height + 'px';
	search_suggestions.style.width = search_width + 'px';

	document.querySelector('form#school-search').addEventListener('submit', clickSearchButton);
	document.getElementById('search-button').addEventListener('click', clickSearchButton);
});


function loadDataFromJSON(file) {
	fetch(file)
		.then(response => response.json())
		.then(data => {
			SCHOOLS_DATA = data;
			document.getElementById('search-field').addEventListener('keydown', function (e) {
				navigateSuggestionList(e);
			});
			document.getElementById('search-field').addEventListener('click', function () {
				loadSuggestedSchools(SCHOOLS_DATA);
			});
		});
}

function loadSuggestedSchools(school_list) {
	input = document.getElementById('search-field').value;

	let school_list_distinct = school_list.reduce((new_arr, curr_elem) => {
		if (!new_arr.some((elem) => {
			return elem[FIELD_NAME_SCHOOL] == curr_elem[FIELD_NAME_SCHOOL];
		})) {
			new_arr.push(curr_elem);
		}
		return new_arr;
	}, []);

	if (input != '') {
		let search_results = fuzzysort.go(input, school_list_distinct, {
			key: [FIELD_NAME_SCHOOL],
			limit: 10,
			threshold: -10000
		});
		let search_suggestions = document.getElementById('search-suggestions');
		let search_suggestions_list = document.getElementById('search-suggestions-list');
		search_suggestions_list.innerHTML = '';

		if (search_results.length == 0 && input.length != 0) {
			let no_results = document.createElement('li');
			no_results.setAttribute('data-id', '-1');
			no_results.innerHTML = '<em>School not found? Let us know!</em>';
			no_results.onclick = (e) => {
				// let search_button = document.getElementById('search-button');
				// search_button.click();
				window.location.href = "not-found/";
			};

			search_suggestions_list.appendChild(no_results);
		} else {
			search_results.forEach((element, index) => {
				let list_item = document.createElement('li');
				list_item.classList.add('notranslate');

				if (index == 0) {
					list_item.classList.add('active');
				}

				list_item.innerHTML = fuzzysort.highlight(fuzzysort.single(input, element.target), '<strong>', '</strong>');
				list_item.setAttribute('data-id', element.obj.id);
				list_item.setAttribute('data-gopass', element.obj.participating);
				list_item.addEventListener('click', clickSuggestionList);

				search_suggestions_list.appendChild(list_item);
				search_suggestions.style.display = 'block';
			});
		}
	}
}

function clickSuggestionList(e) {
	let search_field = document.getElementById('search-field');
	if (e.target.tagName == 'LI') {
		search_field.value = e.target.innerText;
	} else {
		search_field.value = e.target.parentNode.innerText;
	}

	let selected_school_id = e.target.getAttribute('data-id');
	let search_button = document.getElementById('search-button');

	search_button.setAttribute('data-id', selected_school_id);
	search_button.click();
}

function showSuggestionList() {
	let search_suggestions = document.getElementById('search-suggestions');
	let search_suggestions_list = document.getElementById('search-suggestions-list');

	if (search_suggestions_list.childElementCount > 0) {
		search_suggestions.style.display = 'block';
	}
}

function navigateSuggestionList(event) {
	console.log(event.target);
	let search_field = document.getElementById('search-field');
	let search_button = document.getElementById('search-button');
	let search_suggestions = document.getElementById('search-suggestions');
	let suggestion_list_items = document.querySelectorAll('#search-suggestions-list > li');
	let active_suggestion = document.querySelector('#search-suggestions-list > li.active');

	if (isGframeVisible(search_suggestions)) {
		switch (event.keyCode) {
			case 38: // up
				if (active_suggestion != null) {
					active_suggestion.classList.toggle('active');
					if (active_suggestion.previousElementSibling != null) {
						search_field.value = active_suggestion.previousElementSibling.innerText;
						search_button.setAttribute('data-id', active_suggestion.previousElementSibling.getAttribute('data-id'));
						active_suggestion.previousElementSibling.classList.toggle('active');
						active_suggestion.previousElementSibling.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'end'});
					} else {
						search_field.value = suggestion_list_items[suggestion_list_items.length - 1].innerText;
						search_button.setAttribute('data-id', suggestion_list_items[suggestion_list_items.length - 1].getAttribute('data-id'));
						suggestion_list_items[suggestion_list_items.length - 1].classList.toggle('active');
						suggestion_list_items[suggestion_list_items.length - 1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'end'});
					}
				} else {
					search_field.value = suggestion_list_items[suggestion_list_items.length - 1].innerText;
					search_button.setAttribute('data-id', suggestion_list_items[suggestion_list_items.length - 1].getAttribute('data-id'));
					suggestion_list_items[suggestion_list_items.length - 1].classList.toggle('active');
					suggestion_list_items[suggestion_list_items.length - 1].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'end'});
				}
				break;
			case 40: // down
				if (active_suggestion != null) {
					active_suggestion.classList.toggle('active');

					if (active_suggestion.nextElementSibling != null) {
						search_field.value = active_suggestion.nextElementSibling.innerText;
						search_button.setAttribute('data-id', active_suggestion.nextElementSibling.getAttribute('data-id'));
						active_suggestion.nextElementSibling.classList.toggle('active');
						active_suggestion.nextElementSibling.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
					} else {
						search_field.value = suggestion_list_items[0].innerText;
						search_button.setAttribute('data-id', suggestion_list_items[0].getAttribute('data-id'));
						suggestion_list_items[0].classList.toggle('active');
						suggestion_list_items[0].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
					}
				} else {
					search_field.value = suggestion_list_items[0].innerText;
					search_button.setAttribute('data-id', suggestion_list_items[0].getAttribute('data-id'));
					suggestion_list_items[0].classList.toggle('active');
					suggestion_list_items[0].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
				}
				break;
			case 13: // enter
				if (active_suggestion != null) {
					let search_button = document.getElementById('search-button');

					search_button.setAttribute('data-id', active_suggestion.getAttribute('data-id'));
					search_button.click();
				}
				break;
		}
	}
}

function clickSearchButton(ev) {
	// Stop event propagation so the form doesn't submit
	ev.preventDefault();
	ev.stopPropagation();

	let search_suggestions = document.getElementById('search-suggestions');
	search_suggestions.style.display = 'none';

	let search_button = document.querySelector('#search-button');

	let id = search_button.getAttribute('data-id');

	if (id != null) {
		loadSchoolPage(id);
	} else {
		let active_suggestion = document.querySelector('#search-suggestions-list > li.active');
		if (active_suggestion != null) {
			loadSchoolPage(active_suggestion.getAttribute('data-id'));
		}
	}
	return false;
}

function loadSchoolPage(id) {
	let form = document.querySelector('#school-search');
	let input = document.querySelector('#search-field');

	if (id == '-1' && input.value != '') {
		form.setAttribute('action', 'not-found');
		window.location.href = "not-found";
		return false;
	} else {
		let redirectPath = `schools/${id}/`;

		form.setAttribute('action', redirectPath);
		window.location.href =  redirectPath;
		return false;
	}
}

window.addEventListener('resize', function () {
	adjustSuggestionListWidth();
});

function adjustSuggestionListWidth() {
	let search_field = document.getElementById('search-field');
	let search_suggestions = document.getElementById('search-suggestions');
	search_suggestions.style.width = search_field.offsetWidth + 'px';
}

function clickOutsideSearchInput(e) {
	let search_field = document.getElementById('search-field');
	let search_suggestions = document.getElementById('search-suggestions');

	if (!search_suggestions.contains(e.target) && !search_field.contains(e.target) && isGframeVisible(search_suggestions)) {
		search_suggestions.style.display = 'none';
		let list_elem = search_suggestions.querySelector('ul');
		while (list_elem.firstChild) {
			list_elem.removeChild(list_elem.firstChild);
		}
	}
}

const isVisible = elem => !!elem && !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length); 