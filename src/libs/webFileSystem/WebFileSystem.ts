import {
	FileChangeType,
	HTMLFileSystemProvider,
	IFileChange,
	IFileWriteOptions
} from "@codingame/monaco-vscode-files-service-override";

import { StandaloneServices, ILogService } from "vscode/services";
import { fileHandlesStoreName, indexedDB } from "../../workspace/fileSystem";
import { Uri, EventEmitter, Event } from "vscode";

import type { WebFileSystemType } from "./index.ts";

class WebFileSystem extends HTMLFileSystemProvider {
	private readonly changeFileEmitter = new EventEmitter<IFileChange[]>();
	readonly onDidChangeFile: Event<readonly IFileChange[]> = this.changeFileEmitter.event;

	constructor(public readonly type: WebFileSystemType) {
		// No need to remember the OPFS path.
		// Store in indexedDB to avoid selecting folders every time in DFS.
		super(
			type === "dfs" ? indexedDB : undefined,
			type === "dfs" ? fileHandlesStoreName : "unused",
			StandaloneServices.get(ILogService)
		);
	}

	async initFS() {
		let rootDirHandle: FileSystemDirectoryHandle | null = null;

		if (this.type === "opfs") {
			rootDirHandle = await navigator.storage.getDirectory();

			// HTMLFileSystemProvider is not suitable for unnamed folders.
			// OPFS returns the unnamed root folder by default, so create a folder.
			rootDirHandle = await rootDirHandle.getDirectoryHandle("JSIDE", { create: true });
		} else if (this.type === "dfs") {
			// Retrieve files from IndexedDB if available, otherwise create.
			// @ts-expect-error We will get a warning for accessing private methods.
			rootDirHandle = await this.indexedDB?.runInTransaction(
				// @ts-expect-error We will get a warning for accessing private methods.
				this.store,
				"readonly",
				// @ts-expect-error We will get a warning for accessing private methods.
				(store) => store.get("/JSIDE")
			);

			if (rootDirHandle) {
				if ((await rootDirHandle.queryPermission({ mode: "readwrite" })) !== "granted") {
					if ((await rootDirHandle.requestPermission({ mode: "readwrite" })) !== "granted") {
						throw Error("You need to give permission to access the files.");
					}
				}
			} else {
				rootDirHandle = await showDirectoryPicker({
					startIn: "documents",
					mode: "readwrite"
				});

				// If the selected folder is a JSIDE folder, use it, if not, create one and select it.
				if (rootDirHandle.name !== "JSIDE")
					rootDirHandle = await rootDirHandle.getDirectoryHandle("JSIDE", { create: true });
			}
		}

		if (!rootDirHandle) {
			throw Error("Unknown store name!");
		}

		// Set up the folder structure.
		await Promise.all(
			["projects", "libs", "types"].map((name) => rootDirHandle!.getDirectoryHandle(name, { create: true }))
		);

		await this.registerDirectoryHandle(rootDirHandle);
	}

	async writeFile(resource: Uri, content: Uint8Array, opts: IFileWriteOptions): Promise<void> {
		await super.writeFile(resource, content, opts);

		this.changeFileEmitter.fire([
			{
				resource,
				type: opts.create ? FileChangeType.ADDED : FileChangeType.UPDATED
			}
		]);
	}

	readDirectory(resource: Uri) {
		return this.readdir(resource);
	}

	async createDirectory(resource: Uri) {
		// /projects/test/src -> [/projects/test/src, /projects, test/src]
		const [, head, tail] = resource.path.match(/(\w+)\/(.*)/) as [string, string, string];
		const promises = [];

		const paths = tail.split("/");
		const step = [];

		for (const path of paths) {
			step.push(path);

			const fullPath = Uri.joinPath(Uri.file(head), ...step);
			promises.push(this.mkdir(fullPath));
		}

		await Promise.all(promises);
	}
}

export default WebFileSystem;
