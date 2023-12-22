function encodeSVG(svg: string) {
	const encoded = btoa(svg);
	return `data:image/svg+xml;base64,${encoded}`;
}

export { encodeSVG };
