import { mergeOps } from "../util"
export type PluginOpsWs = {
	wujieName: string,
	url: string,
	afterOpen?: (ws: WebSocket) => void,
	afterClose?: (ws: WebSocket) => void,
	afterMessage?: (msg: any) => void,
	beforeMessage?: (msg: any) => { type: string, data: any },
};

const defaultOps = {
	wujieName: 'gislifeMap',
	url: '',
	afterOpen: (ws) => { },
	afterClose: (ws) => { },
	afterMessage: (msg) => { },
	beforeMessage: (msg) => msg,
};

export default function createWsPlugin(options: PluginOpsWs) {
	const mergedOps = mergeOps(defaultOps, options);
	const {
		url,
		beforeMessage,
		wujieName,
		afterOpen,
		afterClose,
		afterMessage
	} = mergedOps;
	if (!url) {
		throw Error('webSocket url is null')
	}
	return {
		install(connector) {
			const socket = new WebSocket(url);

			const onMessage = (msg) => {
				let buildMsg;
				try {
					buildMsg = beforeMessage(JSON.parse(msg));
				} catch (error) {
					console.error("message build error", error)
				}
				connector.$send({
					target: wujieName,
					...buildMsg
				});
				afterMessage(msg);
			};

			const onClose = () => {
				afterClose(socket);
			};

			const onOpen = () => {
				afterOpen(socket);
			};

			socket.addEventListener("open", onOpen);
			socket.addEventListener("message", onMessage);
			socket.addEventListener("close", onClose);

			return () => {
				socket.close();
				connector.unRegisterApp(wujieName);
			}
		}
	}
}