import { App, MarkdownView, Modal, Plugin } from "obsidian";

import { IsbnHandler } from "helpers/helpers";
import axios from "axios";

export default class MyPlugin extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"New Bookscrap",
			(evt: MouseEvent) => {
				new ScrapModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("bookscrap-ribbon");

		this.addCommand({
			id: "open-bookscrap-modal",
			name: "Open Bookscrap Modal",
			callback: () => {
				new ScrapModal(this.app).open();
			},
		});

		// This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: "sample-editor-command",
		// 	name: "Sample editor command",
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection("Sample Editor Command");
		// 	},
		// });
	}

	onunload() {}
}

class ScrapModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.id = "register-modal";
		contentEl.createEl("h1", { text: "New scrap by ISBN" });
		const isbn = contentEl.createDiv({ text: IsbnHandler.placeholder });
		const preview = contentEl.createDiv({ text: "" });
		preview.id = "preview";
		const input = contentEl.createEl("input", { type: "tel" });
		const button = contentEl.createEl("button", { text: "OK" });

		input.oninput = async () => {
			const bookNum = input.value;
			const handler = new IsbnHandler(bookNum);
			isbn.setText(handler.isbnFormat());
			if (bookNum.length != 8) {
				preview.setText("");
				return;
			}
			const f = handler.isbnFull();
			axios
				.get(`https://api.openbd.jp/v1/get?isbn=${f}`)
				.then((response) => {
					if (response.data[0]) {
						const summary = response.data[0].summary;
						preview.setText(summary.title);
					}
				});
		};

		input.onkeydown = (ev) => {
			if (ev.key == "Enter") {
				this.touch(input.value);
			}
		};
		button.onclick = () => {
			this.touch(input.value);
		};
	}

	async touch(bookNum: string) {
		const handler = new IsbnHandler(bookNum);
		const noteName = handler.isbnFull();
		const noteExists = this.app.vault.getAbstractFileByPath(
			noteName + ".md"
		);
		if (!noteExists) {
			await this.app.vault.create(noteName + ".md", "");
		}
		await this.app.workspace.openLinkText(noteName, "", true);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
