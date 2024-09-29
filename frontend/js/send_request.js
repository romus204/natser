import {checkActiveConnection, checkActiveConnectionWithInterval, ConnectionOnline} from "./general.js";

window.onload = function () {
	document.getElementById("send-request-btn").onclick = clickSendMsg
	checkActiveConnection();
	checkActiveConnectionWithInterval()
}

function clickSendMsg() {
	if (!ConnectionOnline()) {
		alert("Connection offline!")
		return
	}

	const connection = sessionStorage.getItem("select-connection");
	const channel = document.getElementById('channel-input').value;
	const message = document.getElementById('request-msg').value;

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

	fetch('/v1/send/request', {
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
				// saveMessageToHistory(channel, message);
			}
			response.json()
				.then(data => {
					document.getElementById('response-msg').textContent = data;
				})
		})
		.catch(error => {
			console.error('Ошибка при отправке сообщения:', error);
		});
}