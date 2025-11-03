import { App, Modal, MarkdownView, Notice } from "obsidian";

import { activeFileBasename } from "helpers/utils";
import axios from "axios";
import { dump } from "js-yaml";

const toHalfWidth = (s: string): string => {
	return s.replace(/[\uff21-\uff3a\uff41-\uff5a\uff10-\uff19]/g, (s) => {
		return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
	});
};

const toAuthorTags = (s: string): string[] => {
	return s
		.split(/\s/)
		.map((x) => x.split("／")[0].trim())
		.map((x) => {
			return x.replace(/(?<![a-z]),/g, "").replace(/\d{4}-/g, "");
		})
		.filter((x) => x.length);
};

const checkFrontmatter = (app: App): boolean => {
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView) return false;
	const activeFile = activeView.file;
	if (!activeFile) return false;
	const cache = app.metadataCache.getFileCache(activeFile);
	if (!cache) return false;
	return !!cache.frontmatter;
};

class BookTitle {
	readonly main: string = "";
	readonly sub: string = "";
	constructor(s: string) {
		const sep = "  ";
		const i = s.trim().replace(/\s/g, " ").indexOf(sep);
		if (i === -1) {
			this.main = s.trim();
			return;
		}
		this.main = s.substring(0, i).trim();
		this.sub = s.substring(i + sep.length).trim();
	}
	format(): string {
		if (this.sub.length < 1) {
			return this.main;
		}
		return `${this.main}――${this.sub}`;
	}
}

interface YondaFrontmatter {
	title: string;
	aliases: string[];
	isbn: number;
	from: string;
	year: number;
	tags: string[];
}

export class FrontmatterGeneratorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const noteBasename = activeFileBasename(this.app);
		if (!view || view.getMode() == "preview") {
			new Notice("このモードでは無効なコマンドです");
			this.close();
			return;
		}
		if (
			!noteBasename ||
			noteBasename.length != 13 ||
			!noteBasename.startsWith("9784")
		) {
			new Notice("ノート名がISBNではありません。");
			this.close();
			return;
		}
		if (checkFrontmatter(this.app)) {
			new Notice("このノートにはもうフロントマターがあります。");
			this.close();
			return;
		}

		const { contentEl } = this;
		contentEl.id = "frontmatter-gen-modal";
		contentEl.createEl("h1", {
			text: "書誌情報",
		});
		const googleBooksButton = contentEl
			.createDiv({ cls: "google-button" })
			.createEl("button", {
				text: "Google Books",
			});
		const title = contentEl.createDiv();
		title.addClass("title");
		const titleInput = title
			.createEl("label", {
				text: "書名（副題はスペース2つで区切る）",
			})
			.createEl("input");
		const publisherInput = contentEl
			.createEl("label", { text: "版元" })
			.createEl("input");
		const publishYearInput = contentEl
			.createEl("label", { text: "刊行年" })
			.createEl("input", { type: "tel" });
		const tagsInput = contentEl
			.createEl("label", { text: "タグ" })
			.createEl("input");
		const previewArea = contentEl.createEl("textarea", { cls: "preview" });
		const execButton = contentEl.createEl("button", {
			text: "OK",
			cls: "exec",
		});

		const bookFrontmatter = (): string => {
			const bookTitle = new BookTitle(titleInput.value);
			const fm: YondaFrontmatter = {
				title: bookTitle.format(),
				aliases: [bookTitle.main],
				isbn: Number(noteBasename),
				from: publisherInput.value,
				year: Number(publishYearInput.value),
				tags: toAuthorTags(tagsInput.value),
			};
			return ["---", dump(fm).trim(), "---"].join("\n");
		};
		const updatePreview = () => {
			previewArea.value = bookFrontmatter();
		};

		[titleInput, publisherInput, publishYearInput, tagsInput].forEach(
			(el) => (el.oninput = updatePreview)
		);

		axios
			.get(`https://api.openbd.jp/v1/get?isbn=${noteBasename}`)
			.then((response) => {
				if (response.data[0]) {
					const summary = response.data[0].summary;
					const sub =
						response.data[0].onix?.DescriptiveDetail?.TitleDetail
							?.TitleElement?.Subtitle?.content || "";
					titleInput.value = `${summary.title}  ${sub}`.trim();
					publisherInput.value = toHalfWidth(summary.publisher);
					publishYearInput.value = summary.pubdate.substring(0, 4);
					tagsInput.value = summary.author;
					updatePreview();
				}
			});

		googleBooksButton.onclick = () => {
			axios
				.get(
					`https://www.googleapis.com/books/v1/volumes?q=isbn:${noteBasename}`
				)
				.then((response) => {
					if (response.data.items) {
						const vInfo = response.data.items[0].volumeInfo;
						const sub = vInfo.subtitle || "";
						titleInput.value = `${vInfo.title}  ${sub}`.trim();
						publisherInput.value = toHalfWidth(
							vInfo.publisher || ""
						);
						publishYearInput.value = (
							vInfo.publishedDate || ""
						).substring(0, 4);
						tagsInput.value = toHalfWidth(vInfo.authors.join(" "));
						updatePreview();
					}
				});
		};

		execButton.onclick = async () => {
			const editor = this.app.workspace.activeEditor?.editor;
			if (editor) {
				editor.setLine(0, previewArea.value + "\n" + editor.getLine(0));
			}
			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
