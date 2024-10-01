import { Plugin } from "obsidian";

import { RegisterModal } from "Modals/Register";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";

const COMMAND_RegisterNote = "register note";
const COMMAND_GenerateFrontmatter = "generate frontmatter";

export default class Yonda extends Plugin {
	async onload() {
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			COMMAND_RegisterNote,
			() => {
				new RegisterModal(this.app).open();
			}
		);
		ribbonIconEl.addClass("yonda-ribbon");

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
