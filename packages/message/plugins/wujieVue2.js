import { mergeOps } from "../src/util";
const WuJiePackage = require("wujie-vue2").default;

const defaultOps = {
	wujieName: 'gislifeMap',
	messageCallback: (...msgs) => {
		return msgs[0]
	},
};



export default function createWuJieVue2Plugin(options) {
	const mergedOps = mergeOps(defaultOps, options);
	const {
		messageCallback,
		wujieName
	} = mergedOps;


	const { bus } = WuJiePackage;
	return {
		install(connector) {
			const msgProcess = (...params) => {
				const buildMsg = messageCallback(...params);

				connector.$send({
					target: wujieName,
					...buildMsg
				});
				connector.on((msg) => {
					bus.$emit(wujieName + '-Receive', {
						type: msg.type,
						response: connector._getResponse(msg)
					})
				});
			};

			bus.$on(wujieName, msgProcess);
			return () => {
				bus.$off(wujieName, msgProcess);
				connector.unRegisterApp(wujieName);
			}
		}
	}
}

