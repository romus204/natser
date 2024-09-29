const svgReset = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
</svg>`

const svgFavorite = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark" viewBox="0 0 16 16">
  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
</svg>`

const svgTrash = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
</svg>`

import {addMessageToFavorites} from './favorite.js'

export function saveMessageToHistory(channel, message) {
	const history = JSON.parse(localStorage.getItem('messageHistory')) || [];
	const timestamp = new Date().toLocaleString();
	if (history.length >= 15) {
		history.splice(0, 1);
		document.getElementById('history-messages').firstElementChild.remove()
	}
	history.push({channel, message, timestamp});
	localStorage.setItem('messageHistory', JSON.stringify(history));
	addMessageToHistoryDisplay(channel, message, timestamp);
}

// Загрузка и отображение истории сообщений из localStorage
export function loadMessageHistory() {
	const history = JSON.parse(localStorage.getItem('messageHistory')) || [];
	history.forEach(entry => {
		addMessageToHistoryDisplay(entry.channel, entry.message, entry.timestamp);
	});
}

// Добавление сообщения в отображаемую историю
export function addMessageToHistoryDisplay(channel, message, timestamp) {
	const messageHistory = document.getElementById('history-messages');
	const listItem = document.createElement('li');
	listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

	const messageText = document.createElement('span');
	messageText.textContent = `[${timestamp}] - ${channel}\n${message}`;
	messageText.classList.add('text-break', 'custom-mr');

	const buttonGroup = document.createElement('div');
	buttonGroup.classList.add('d-flex');

	// Кнопка переотправки сообщения
	const resendButton = document.createElement('button');
	resendButton.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2');
	resendButton.innerHTML = svgReset;
	// resendButton.textContent = 'Переотправить';
	resendButton.onclick = function () {
		resendMessage(channel, message);
	};

	// Кнопка добавления в избранное
	const favoriteButton = document.createElement('button');
	favoriteButton.classList.add('btn', 'btn-sm', 'btn-outline-warning', 'me-2');
	favoriteButton.innerHTML = svgFavorite
	// favoriteButton.textContent = 'В избранное';
	favoriteButton.onclick = function () {
		addMessageToFavorites(channel, message, timestamp);
	};

	// Кнопка удаления сообщения
	const deleteButton = document.createElement('button');
	deleteButton.classList.add('btn', 'btn-sm', 'btn-outline-danger');
	// deleteButton.textContent = 'Удалить';
	deleteButton.innerHTML = svgTrash
	deleteButton.onclick = function () {
		deleteMessageFromHistory(timestamp);
		messageHistory.removeChild(listItem);
	};

	buttonGroup.appendChild(resendButton);
	buttonGroup.appendChild(favoriteButton);
	buttonGroup.appendChild(deleteButton);

	listItem.appendChild(messageText);
	listItem.appendChild(buttonGroup);

	messageHistory.appendChild(listItem);
}

// Удаление сообщения из истории
function deleteMessageFromHistory(timestamp) {
	let history = JSON.parse(localStorage.getItem('messageHistory')) || [];
	history = history.filter(entry => entry.timestamp !== timestamp);
	localStorage.setItem('messageHistory', JSON.stringify(history));
}

// Переотправка сообщения
function resendMessage(channel, message) {
	const messageData = {
		connection_guid: sessionStorage.getItem("select-connection"),
		channel,
		message,
	};

	fetch('/v1/send', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(messageData)
	})
		.then(response => {
			if (response.ok) {
				console.log('Сообщение переотправлено');
			}
		})
		.catch(error => console.error('Ошибка:', error));
}