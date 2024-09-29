import {checkActiveConnection, checkActiveConnectionWithInterval, ConnectionOnline} from "./general.js";
import {loadMessageHistory, saveMessageToHistory} from "./history.js";
import {loadFavoriteMessages} from "./favorite.js";

window.onload = function () {
	document.getElementById("send-msg-btn").onclick = clickSendMsg
	checkActiveConnection();
	checkActiveConnectionWithInterval();
	loadMessageHistory();
	loadFavoriteMessages();

}

function clickSendMsg() {
	if (!ConnectionOnline()) {
		alert("Connection offline!")
		return
	}

	const connection = sessionStorage.getItem("select-connection");
	const channel = document.getElementById('channel-input').value;
	const message = document.getElementById('message-input').value;

	if (!connection) {
		alert('Не выбрано подключение');
		return;
	}

	if (!channel) {
		alert('Не выбран канал');
		return;
	}

	if (!message) {
		alert('Введите сообщение');
		return;
	}

	const messageData = {
		connection_guid: connection,
		channel,
		message
	};

	fetch('/v1/send', {
		// mode: 'no-cors',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// 'Origin': 'http://localhost:3000',
		},
		body: JSON.stringify(messageData)
	})
		.then(response => {
			if (response.ok) {
				saveMessageToHistory(channel, message);
			}
		})
		.catch(error => {
			console.error('Ошибка при отправке сообщения:', error);
			// var fafa = error === error;
			// alert('Не удалось отправить сообщение. Попробуйте снова.');
		});
}