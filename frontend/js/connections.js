import {checkActiveConnection, connIndicatorWait} from "./general.js";
import {checkConnection} from "./general.js";
import {checkActiveConnectionWithInterval} from "./general.js";


window.onload = function () {
	document.getElementById('addConnectionModal').addEventListener('submit', function (event) {
		event.preventDefault();
		addNewConnection();
	});

	updateConnections();
	checkActiveConnection();
	checkActiveConnectionWithInterval();
}

const svgTrash = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
</svg>`

function updateConnections() {
	fetch('/v1/connections')
		.then(response => response.json())
		.then(data => {
			const connectionSelect = document.getElementById('connection-select');
			connectionSelect.innerHTML = '';
			data.forEach(connection => {
				const buttonRow = document.createElement('div');
				buttonRow.className = 'flex-row d-flex mt-2';

				const connButton = document.createElement('button');
				connButton.textContent = connection.name;
				connButton.setAttribute('guid', connection.guid); // Сохраняем guid в data-атрибуте
				connButton.className = 'list-group-item list-group-item-action col-6 rounded btn'
				connButton.addEventListener('click', clickConnection);

				if (sessionStorage.getItem('select-connection') === connection.guid) {
					connButton.classList.add('active');
				}

				const deleteButton = document.createElement('button');
				deleteButton.innerHTML = svgTrash;
				deleteButton.setAttribute('guid', connection.guid); // Сохраняем guid в data-атрибуте
				deleteButton.className = 'btn btn-danger list-group-item rounded border-1 ms-2'
				deleteButton.addEventListener('click', clickDeleteConnection);


				buttonRow.appendChild(connButton);
				buttonRow.appendChild(deleteButton);

				connectionSelect.appendChild(buttonRow);

			});
		})
		.catch(error => {
			console.error('Ошибка при загрузке подключений:', error);
		});


}

function clickConnection() {
	const guid = this.getAttribute('guid');
	const rows = document.getElementById('connection-select').children
	for (const row of rows) {
		for (const button of row.children) {
			button.classList.remove('active');

		}
	}
	this.classList.add('active');
	checkConnection(guid)
	writeConnectionInSessionStore(guid)
}

function clickDeleteConnection() {
	const guid = this.getAttribute('guid');
	deleteConnection(guid);
}

function writeConnectionInSessionStore(guid) {
	sessionStorage.setItem('select-connection', guid)
}

function deleteConnection(guid) {
	const req = {
		guid: guid,
	}
	fetch('/v1/connections', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(req)
	})
		.then(response => response.json())
		.then(() => {
			updateConnections();
			if (guid === sessionStorage.getItem('select-connection')) {
				connIndicatorWait();
				sessionStorage.setItem('select-connection', "")
			}

		})
		.catch(error => {
			console.error('Ошибка при удалении подключения:', error);
			alert('Не удалось удалить подключение. Попробуйте снова.');
		});
}

// Добавление нового подключения
function addNewConnection() {
	const name = document.getElementById('connection-name').value;
	const host = document.getElementById('connection-host').value;
	const port = document.getElementById('connection-port').value;
	const login = document.getElementById('connection-login').value;
	const password = document.getElementById('connection-password').value;

	const newConnection = {
		name,
		host,
		port,
		login,
		password
	};

	fetch('/v1/connections', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newConnection)
	})
		.then(response => response.json())
		.then(() => {
			updateConnections(); // Обновляем список подключений
		})
		.catch(error => {
			console.error('Ошибка при добавлении подключения:', error);
			alert('Не удалось добавить новое подключение. Попробуйте снова.');
		});
}