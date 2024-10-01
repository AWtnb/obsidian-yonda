import { App, Modal, MarkdownView } from "obsidian";

import { activeFileBasename } from "Modals/helpers";
import axios from "axios";

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

interface Frontmatter {
	aliases: string[];
	isbn: string;
	from: string;
	year: number;
	tags: string[];
}

interface BookInfo {
	title: string;
	subTitle: string;
	isbn: string;
	publisher: string;
	pubYear: string;
	author: string;
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
			this.close();
			return;
		}

		const { contentEl } = this;
		contentEl.id = "frontmatter-gen-modal";
		contentEl.createEl("h1", { text: "New scrap by ISBN" });
		const titleInput = contentEl
			.createEl("label", { text: "title" })
			.createEl("input");
		const subTitle = contentEl.createDiv();
		subTitle.addClass("subtitle");
		const subTitleInput = subTitle
			.createEl("label", { text: "subtitle" })
			.createEl("input");
		const clearSubTitleButton = subTitle.createEl("button", {
			text: "Clear",
		});
		clearSubTitleButton.onclick = () => {
			subTitleInput.value = "";
		};
		const publisherInput = contentEl
			.createEl("label", { text: "publisher" })
			.createEl("input");
		const publishYearInput = contentEl
			.createEl("label", { text: "publish year" })
			.createEl("input", { type: "tel" });
		const tagsInput = contentEl
			.createEl("label", { text: "tags" })
			.createEl("input");

		axios
			.get(`https://api.openbd.jp/v1/get?isbn=${noteBasename}`)
			.then((response) => {
				if (response.data[0]) {
					const summary = response.data[0].summary;
					titleInput.value = summary.title;
					subTitleInput.value =
						response.data[0].onix.DescriptiveDetail.TitleDetail
							.TitleElement.TitleText.content || "";
					publisherInput.value = toHalfWidth(summary.publisher);
					publishYearInput.value = summary.pubdate.substring(0, 4);
					tagsInput.value = summary.author;
				}
			});

			const googleBooksButton = contentEl.createEl("button", {
			text: "Google Books",
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
					}
				});
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
