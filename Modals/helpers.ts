import { App, Modal, MarkdownView } from "obsidian";

export class IsbnHandler {
	private isbn: string;
	static placeholder: string = "978-4-00000000-0";

	constructor(bookNum: string) {
		const s = ("00000000" + bookNum).substring(0, 16);
		this.isbn = "9784" + s.substring(s.length - 8, s.length);
	}

	private checkDigit(): string {
		const total = String(this.isbn)
			.split("")
			.map((n, i) => {
				if (i % 2 == 0) {
					return Number(n);
				}
				return Number(n) * 3;
			})
			.reduce((accum, x) => {
				return accum + Number(x);
			}, 0);
		return String((10 - (total % 10)) % 10);
	}

	isbnFull(): string {
		return `${this.isbn}${this.checkDigit()}`;
	}

	isbnFormat(): string {
		const s = this.isbnFull();
		return (
			s.substring(0, 3) +
			"-" +
			s.substring(3, 4) +
			"-" +
			s.substring(4, 12) +
			"-" +
			s.substring(12, 13)
		);
	}
}

export const activeFileBasename = (app: App): string => {
	const activeLeaf = app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeLeaf) return "";
	const activeFile = activeLeaf.file;
	if (!activeFile) return "";
	return activeFile.basename;
}