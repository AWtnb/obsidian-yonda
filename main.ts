import { Plugin } from "obsidian";

import { RegisterModal } from "Modals/Register";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";

const COMMAND_RegisterNote = "register note";
const COMMAND_GenerateFrontmatter = "generate frontmatter";

// https://forum.obsidian.md/t/list-of-available-icons-for-component-seticon/16332/3

export default class Yonda extends Plugin {
	async onload() {
		this.addRibbonIcon("popup-open", COMMAND_RegisterNote, () => {
			new RegisterModal(this.app).open();
		}).addClass("yonda-register-ribbon");

		this.addRibbonIcon("documents", COMMAND_GenerateFrontmatter, () => {
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
	}

	onunload() {}
}
