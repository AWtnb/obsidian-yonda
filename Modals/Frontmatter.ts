import { App, Modal, MarkdownView, Notice } from "obsidian";

import { activeFileBasename } from "Modals/helpers";
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

interface YondaFrontmatter {
	aliases: string[];
	isbn: string;
	from: string;
	year: string;
	tags: string[];
}

export class FrontmatterGeneratorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen(): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const noteBasename = activeFileBasename(this.app);
		if (
			!view ||
			view.getMode() == "preview" ||
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
		const titleInput = contentEl
			.createEl("label", { text: "title" })
			.createEl("input");
		const subTitle = contentEl.createDiv();
		subTitle.addClass("subtitle");
		const subTitleInput = subTitle
			.createEl("label", { text: "subtitle" })
			.createEl("input");
		const clearSubTitleButton = subTitle.createEl("button", {
			text: "\u00d7",
		});
		const publisherInput = contentEl
			.createEl("label", { text: "publisher" })
			.createEl("input");
		const publishYearInput = contentEl
			.createEl("label", { text: "publish year" })
			.createEl("input", { type: "tel" });
		const tagsInput = contentEl
			.createEl("label", { text: "tags" })
			.createEl("input");
		const previewArea = contentEl.createEl("textarea", { cls: "preview" });
		const execButton = contentEl.createEl("button", {
			text: "OK",
			cls: "exec",
		});

		const titleAliases = (): string[] => {
			const main = toHalfWidth(titleInput.value).trim();
			const sub = toHalfWidth(subTitleInput.value).trim();
			if (main == sub || sub.length < 1) {
				return [main];
			}
			return [`${main}――${sub}`, main];
		};

		const bookFrontmatter = (): string => {
			const fm: YondaFrontmatter = {
				aliases: titleAliases(),
				isbn: noteBasename,
				from: publisherInput.value,
				year: publishYearInput.value,
				tags: toAuthorTags(tagsInput.value),
			};
			return ["---", dump(fm).trim(), "---"].join("\n");
		};
		const updatePreview = () => {
			previewArea.value = bookFrontmatter();
		};

		[
			titleInput,
			subTitle,
			subTitleInput,
			clearSubTitleButton,
			publisherInput,
			publishYearInput,
			tagsInput,
		].forEach((el) => (el.oninput = updatePreview));
		clearSubTitleButton.onclick = () => {
			subTitleInput.value = "";
			updatePreview();
		};

		axios
			.get(`https://api.openbd.jp/v1/get?isbn=${noteBasename}`)
			.then((response) => {
				if (response.data[0]) {
					const summary = response.data[0].summary;
					titleInput.value = summary.title;
					subTitleInput.value =
						response.data[0].onix?.DescriptiveDetail?.TitleDetail
							?.TitleElement?.Subtitle?.content || "";
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
						titleInput.value = vInfo.title;
						subTitleInput.value = vInfo.subtitle || "";
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
			const activeView =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) return;
			const file = activeView.file;
			if (!file) return;
			await this.app.vault.modify(
				file,
				previewArea.value + "\n" + (await this.app.vault.read(file))
			);
			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
