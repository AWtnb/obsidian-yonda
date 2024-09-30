import { App, Modal } from "obsidian";

import { activeFileBasename } from "helpers/helpers";
import axios from "axios";

export class FrontmatterGeneratorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const noteBasename = activeFileBasename(this.app);
		if (
			!noteBasename ||
			noteBasename.length != 13 ||
			!noteBasename.startsWith("978")
		) {
			this.close();
			return;
		}

		const { contentEl } = this;
		contentEl.id = "frontmatter-gen-modal";
		contentEl.createEl("h1", { text: "New scrap by ISBN" });
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
