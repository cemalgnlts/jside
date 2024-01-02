import {
	IndexedDB,
	IndexedDBFileSystemProvider,
	registerCustomProvider
} from "@codingame/monaco-vscode-files-service-override";

let indexedDB: IndexedDB;
let userDataProvier: IndexedDBFileSystemProvider;

const fileHandlesStoreName = "filehandles-store";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace Schemas {
	export const file = "file";
	export const vscodeUserData = "vscode-userdata";
	export const logs = "vscode-log";
}

async function createIndexedDBProviders(): Promise<void> {
	const userDataStore = "userdata-store";
	const logsStore = "logs-store";

	indexedDB = await IndexedDB.create("jside-db", 1, [userDataStore, logsStore, fileHandlesStoreName]);

	const logFileSystemProvider = new IndexedDBFileSystemProvider(Schemas.logs, indexedDB, logsStore, false);
	registerCustomProvider(Schemas.logs, logFileSystemProvider);

	userDataProvier = new IndexedDBFileSystemProvider(Schemas.vscodeUserData, indexedDB, userDataStore, true);
	registerCustomProvider(Schemas.vscodeUserData, userDataProvier);
}

export { createIndexedDBProviders, indexedDB, fileHandlesStoreName };
