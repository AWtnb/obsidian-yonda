import { App, Modal } from "obsidian";

import { IsbnHandler, activeFileBasename } from "helpers/utils";
import axios from "axios";

export class RegisterModal extends Modal {
	private readonly noteBasename: string;
	constructor(app: App) {
		super(app);
		this.noteBasename = activeFileBasename(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.id = "register-modal";
		contentEl.createEl("h1", { text: "ISBNで登録" });
		const isbn = contentEl.createDiv({ text: IsbnHandler.placeholder });
		const preview = contentEl.createDiv({ text: "" });
		preview.id = "preview-title";
		const input = contentEl.createEl("input", { type: "tel" });
		const button = contentEl.createEl("button", { text: "OK" });

		input.focus();
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
		if (bookNum.length < 1 || !Number(bookNum)) {
			return;
		}
		const handler = new IsbnHandler(bookNum);
		const noteName = handler.isbnFull();
		const noteExists = this.app.vault.getAbstractFileByPath(
			noteName + ".md"
		);
		if (!noteExists) {
			await this.app.vault.create(noteName + ".md", "");
		}
		if (!this.noteBasename || this.noteBasename != noteName) {
			await this.app.workspace.openLinkText(noteName, "", true);
		}
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
