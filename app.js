const WebSocket = require("ws");
const fetch = require("node-fetch");
const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const token = "TVOJ TOKEN";
const target = "ID OD KOGA HOCES BULLY";
const message = "Hello Samir!";

function recursion() {
	let ws = new WebSocket("wss://gateway.discord.gg/?v=10&encording=json");

	ws.onopen = () => console.log("Connected");

	ws.onclose = () => recursion();

	ws.onmessage = async function (event) {
		const data = JSON.parse(event.data);

		if (data?.d?.heartbeat_interval !== undefined) {
			var interval = JSON.parse(event.data)["d"]["heartbeat_interval"];
			hb(ws, interval);

			ws.send(
				JSON.stringify({
					op: 2,
					d: {
						token: token,
						properties: {
							os: "Linux",
							browser: "Firefox",
						},
						compress: false,
					},
				})
			);
		}

		switch (data["t"]) {
			case "MESSAGE_CREATE":
				MESSAGECREATE_Event(data);
				break;
		}
	};
}

async function hb(socket, interval) {
	while (true) {
		let hbpayload = {
			op: 1,
			d: "null",
		};

		socket.send(JSON.stringify(hbpayload));
		await sleep(interval);
	}
}

async function MESSAGECREATE_Event(data) {
	if (data.d?.type === 0 && data.d?.author?.id === target) {
		await fetch(
			`https://discord.com/api/v9/channels/${data.d?.channel_id}/messages`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({
					content: message,
					message_reference: {
						message_id: data.d?.id,
						channel_id: data.d?.channel_id,
						guild_id: data.d?.guild_id,
					},
				}),
			}
		).catch((error) => console.log("Error: " + error));
	}
}

recursion();
console.clear();
