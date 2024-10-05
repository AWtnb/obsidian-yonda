import { Plugin } from "obsidian";

import { RegisterModal } from "Modals/Register";
import { FrontmatterGeneratorModal } from "Modals/Frontmatter";
import { ObsidianIcons } from "Modals/icons";

const COMMAND_RegisterNote = "ノートを作る／開く";
const COMMAND_GenerateFrontmatter = "フロントマターを作る";

export default class Yonda extends Plugin {
	async onload() {
		this.addRibbonIcon(
			ObsidianIcons.CreateNew,
			COMMAND_RegisterNote,
			() => {
				new RegisterModal(this.app).open();
			}
		).addClass("yonda-register-ribbon");

		this.addRibbonIcon(
			ObsidianIcons.Pencil,
			COMMAND_GenerateFrontmatter,
			() => {
				new FrontmatterGeneratorModal(this.app).open();
			}
		).addClass("yonda-generate-frontmatter-ribbon");

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
