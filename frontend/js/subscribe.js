import {checkActiveConnection, checkActiveConnectionWithInterval, ConnectionIsOnline} from "./general.js";

window.onload = function () {
	document.getElementById("subscribe-msg-btn").onclick = clickSubscribe
	checkActiveConnection();
	checkActiveConnectionWithInterval()
}

function clickSubscribe() {
	if (!ConnectionIsOnline) {
		alert("Connection offline!")
		return
	}
	const req = {
		channel: document.getElementById("channel-input").value,
		connection_guid: sessionStorage.getItem('select-connection'),
	}

	let socket = new WebSocket(`/ws/subscribe/channel/`);

	socket.onopen = function (e) {
		socket.send(JSON.stringify(req))
	};

	socket.onmessage = function (event) {
		addMsgOnDisplay(event.data)
	};

	socket.onerror = function (error) {
		console.log(error);
	};


}

function addMsgOnDisplay(msg) {
	msg = JSON.parse(msg);
	const msgGUID = crypto.randomUUID()
	const messageHistory = document.getElementById('sub-message-card');
	const all = document.createElement('div');
	all.classList.add('border', 'border-white', 'border-opacity-25', 'rounded', 'mt-2');
	const header = document.createElement('div');
	const headerLeft = document.createElement('div');
	headerLeft.textContent = `${msg.subject}`
	headerLeft.classList.add('text-start', 'col');

	const headerRight = document.createElement('div');
	const date = new Date()
	headerRight.textContent = `${date.toLocaleDateString()} -- ${date.toLocaleTimeString()}`;
	headerRight.classList.add('text-end', 'col');
	header.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');
	header.appendChild(headerLeft);
	header.appendChild(headerRight);

	const headersBtn = document.createElement('div');
	headersBtn.classList.add('card-header', 'btn', 'text-start', 'd-grid', 'gap-2');
	headersBtn.setAttribute('data-bs-toggle', 'collapse');
	headersBtn.setAttribute('data-bs-target', `#Headers-msg-${msgGUID}`);
	headersBtn.setAttribute('aria-expanded', 'false');
	headersBtn.setAttribute('aria-controls', `Headers-msg-${msgGUID}`);
	headersBtn.textContent = 'Headers';
	// headers.textContent = `Headers: \n${JSON.stringify(msg.headers, null, "\t")}`;

	const headersBody = document.createElement('div');
	headersBody.id = `Headers-msg-${msgGUID}`;
	headersBody.classList.add('collapse', 'mb-2', 'container');
	headersBody.textContent = JSON.stringify(msg.headers, null, "\t");


	const body = document.createElement('div');
	body.textContent = msg.data;
	body.classList.add('text-break', 'card-body', 'border-top');

	all.appendChild(header);
	all.appendChild(headersBtn);
	all.appendChild(headersBody);
	all.appendChild(body);

	messageHistory.appendChild(all);

}