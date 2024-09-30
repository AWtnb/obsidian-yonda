import { Plugin } from "obsidian";

import { ScrapModal } from "Modals/Scrap";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";

export default class Bookscrap extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Create or open bookscrap",
			(evt: MouseEvent) => {
				new ScrapModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("bookscrap-ribbon");

		this.addCommand({
			id: "open-bookscrap-modal",
			name: "Create or open bookscrap",
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					new ScrapModal(this.app).open();
				}
				return true;
			},
		});

		this.addCommand({
			id: "open-bookscrap-frontmatter-generator-modal",
			name: "Generate bookscrap frontmatter",
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
