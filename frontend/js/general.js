export let ConnectionIsOnline = false

export function checkConnection(guid) {
	fetch('/v1/connections/check/' + guid)
		.then(response => response.json())
		.then(data => {
			if (data.connected) {
				connIndicatorOnline();
				ConnectionIsOnline = true
			} else {
				connIndicatorOffline();
				ConnectionIsOnline = false
			}
		})
		.catch(error => {
			connIndicatorOffline();
			ConnectionIsOnline = false
		})
}

export function connIndicatorOffline() {
	const indicator = document.getElementById('connection-status')
	indicator.textContent = 'Offline'
	indicator.style.color = "#ff5e68"
}

export function connIndicatorOnline() {
	const indicator = document.getElementById('connection-status')
	indicator.textContent = 'Online'
	indicator.style.color = "#6fffa0"
}

export function connIndicatorWait() {
	const indicator = document.getElementById('connection-status')
	indicator.textContent = 'Wait..'
	indicator.style.color = "#939393"
}

export function checkActiveConnection() {
	const selectedConn = sessionStorage.getItem('select-connection');

	selectedConn ? checkConnection(selectedConn) : connIndicatorWait();

}

export function checkActiveConnectionWithInterval() {
	setInterval(checkActiveConnection, 3000)
}

export function ConnectionOnline() {
	return ConnectionIsOnline
}
