import { ListSymbols, NestedCircumfix } from "helpers/utils";
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

		const bracketHandler = new NestedCircumfix(["「", "」"], ["『", "』"]);
		const getTitleLine = (): string => {
			const t = bracketHandler.fix(`「${title.value}」`);
			if (chap.value.trim().length < 1) {
				return t;
			}
			return `第${chap.value}章 ${t}`;
		};

		const updatePreview = () => {
			preview.textContent = getTitleLine();
		};

		chap.oninput = updatePreview;
		title.oninput = updatePreview;

		const insertTitleLine = () => {
			if (title.value.length < 1) {
				return;
			}
			const cursor = this.editor.getCursor();
			const tl = getTitleLine();
			this.editor.setLine(
				cursor.line,
				this.editor.getLine(cursor.line) + "\n\n" + tl + "\n- "
			);
			this.editor.setCursor(cursor.line + 3);
			this.close();
		};

		button.onclick = insertTitleLine;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
