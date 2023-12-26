async function requestOPFSPersistentPermission(): Promise<undefined> {
	const isPersisted = await navigator.storage.persisted();

	if (isPersisted) return;

	const isPersist = await navigator.storage.persist();

	if (isPersist) return;

	throw Error(`Persistent file storage permission for OPFS is denied!
Your files may be deleted by the browser! Enabling PWA can help to make it persistent.`);
}

function encodeSVG(svg: string) {
	const encoded = btoa(svg);
	return `data:image/svg+xml;base64,${encoded}`;
}

export { requestOPFSPersistentPermission, encodeSVG };
