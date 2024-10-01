import { Plugin } from "obsidian";

import { ScrapModal } from "Modals/Scrap";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";

export default class Yonda extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Create or open yonda-note",
			(evt: MouseEvent) => {
				new ScrapModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("yonda-ribbon");

		this.addCommand({
			id: "open-yonda-modal",
			name: "Create or open yonda-note",
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					new ScrapModal(this.app).open();
				}
				return true;
			},
		});

		this.addCommand({
			id: "open-yonda-frontmatter-generator-modal",
			name: "Generate yonda frontmatter",
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					new FrontmatterGeneratorModal(this.app).open();
				}
				return true;
			},
		});
	}

	onunload() {}
}
