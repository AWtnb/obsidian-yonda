import { App, Modal, Editor, MarkdownView } from "obsidian";

export class ChapterModal extends Modal {
	private readonly editor: Editor;
	private readonly view: MarkdownView;

	constructor(app: App, editor: Editor, view: MarkdownView) {
		super(app);
		this.editor = editor;
		this.view = view;
	}

	onOpen() {
		if (!this.view || this.view.getMode() == "preview") {
			this.close();
			return;
		}

		const { contentEl } = this;
		contentEl.id = "chapter-modal";
		const preview = contentEl.createDiv({ text: "第0章「」" });
		preview.id = "preview-chapter";
		const chap = contentEl
			.createEl("label", { text: "chapter" })
			.createEl("input", { type: "number" });
		chap.addClass("chap");
		const title = contentEl
			.createEl("label", { text: "title" })
			.createEl("input", { type: "text" });
		const button = contentEl.createEl("button", { text: "OK" });

		chap.focus();

		const getTitleLine = (): string => {
			return `第${chap.value}章「${title.value}」`;
		};

		const updatePreview = () => {
			preview.textContent = getTitleLine();
		};

		chap.oninput = updatePreview;
		title.oninput = updatePreview;

		const insertTitleLine = () => {
			if (chap.value.length < 1 || title.value.length < 1) {
				return;
			}
			const tl = getTitleLine();
			const cursor = this.editor.getCursor();
			this.editor.replaceRange(tl, this.editor.getCursor());
			this.editor.setCursor(
				cursor.line,
				this.editor.getLine(cursor.line).length
			);
			this.close();
		};

		button.onclick = insertTitleLine;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
