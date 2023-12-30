export async function App2() {
	const {
		attachPart,
		isPartVisibile,
		onPartVisibilityChange,
		Parts,
		setPartVisibility
	} = await import("@codingame/monaco-vscode-views-service-override");
	const { Sash } = await import("monaco-editor/esm/vs/base/browser/ui/sash/sash.js");
	await import('./load-monaco.ts').then(({ loadMonaco }) => loadMonaco((parts) => {
		for (const part of parts) {
			const id = part.split(".")[2];
			const el = document.getElementById(id) as HTMLDivElement;

			attachPart(part, el);

			onPartVisibilityChange(part, (isVisible) => {
				el.style.display = isVisible ? "" : "none";

				if (part === Parts.SIDEBAR_PART) {
					if (isVisible) document.documentElement.style.removeProperty("--sidebar-width");
					else document.documentElement.style.setProperty("--sidebar-width", "0px");
				}
			});

			if (!isPartVisibile(part)) el.style.display = "none";

			if (part === Parts.PANEL_PART) {
				setPartVisibility(Parts.PANEL_PART, false);
			}
			else if (part === Parts.SIDEBAR_PART) {
				const sash = new Sash(
					el,
					{
						getVerticalSashLeft() {
							return 1;
						}
					},
					{ orientation: 0 }
				);

				sash.onDidReset(() => {
					document.documentElement.style.removeProperty("--sidebar-width");
				});

				sash.onDidChange((ev: import("monaco-editor/esm/vs/base/browser/ui/sash/sash.js").ISashEvent) => {
					const width = document.body.clientWidth - ev.currentX;
					document.documentElement.style.setProperty("--sidebar-width", `${width}px`);
				});
			}
		}
	}))
}

