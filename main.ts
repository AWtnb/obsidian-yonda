import { Plugin, Editor, MarkdownView } from "obsidian";

import { RegisterModal } from "Modals/Register";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";
import { ChapterModal } from "Modals/Chapter";
import { addSymbol } from "helpers/inlist";

const COMMAND_RegisterNote = "ノートを作る／開く";
const COMMAND_GenerateFrontmatter = "フロントマターを作る";

/*
icons
https://lucide.dev/icons/
https://docs.obsidian.md/Plugins/User+interface/Icons#Browse+available+icons
*/

export default class Yonda extends Plugin {
	async onload() {
		this.addRibbonIcon("book-plus", COMMAND_RegisterNote, () => {
			new RegisterModal(this.app).open();
		}).addClass("yonda-register-ribbon");

		this.addRibbonIcon("badge-info", COMMAND_GenerateFrontmatter, () => {
			new FrontmatterGeneratorModal(this.app).open();
		}).addClass("yonda-generate-frontmatter-ribbon");

		this.addCommand({
			id: "yonda-open-register-modal",
			name: COMMAND_RegisterNote,
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					new RegisterModal(this.app).open();
				}
				return true;
			},
		});

		this.addCommand({
			id: "yonda-generate-frontmatter",
			name: COMMAND_GenerateFrontmatter,
			checkCallback: (checking: boolean): boolean => {
				if (!checking) {
					new FrontmatterGeneratorModal(this.app).open();
				}
				return true;
			},
		});

		this.addCommand({
			id: "yonda-add-inline-quote",
			name: "リスト内に引用",
			icon: "quote",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				addSymbol(">", editor, view);
			},
		});

		this.addCommand({
			id: "yonda-add-inline-bulb",
			name: "リスト内に:bulb:",
			icon: "lightbulb",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				addSymbol(":bulb:", editor, view);
			},
		});

		this.addCommand({
			id: "yonda-add-inline-chapter-title",
			name: "章見出しを追加",
			icon: "pen",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new ChapterModal(this.app, editor, view).open();
			},
		});
	}

	onunload() {}
}
