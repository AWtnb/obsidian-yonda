import { App, Editor, MarkdownView } from "obsidian";

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
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView) return "";
	const activeFile = activeView.file;
	if (!activeFile) return "";
	return activeFile.basename;
}

export const addListLineWithSymbol = (
	symbol: string,
	editor: Editor,
	view: MarkdownView
) => {
	if (!view || view.getMode() == "preview") {
		return;
	}
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	if (line.length < 1) {
		editor.replaceSelection("- " + symbol + " ");
		return;
	}

	const newListLine: string = (() => {
		const listSymbols = ["- ", "+ ", "* "];
		const indent = line.substring(0, line.length - line.trimStart().length);
		const content = line.trimStart();
		// if line is already list
		if (listSymbols.includes(content.substring(0, 2))) {
			return (
				indent +
				content.substring(0, 2) +
				symbol +
				" " +
				content.substring(2)
			);
		}
		return indent + listSymbols[0] + symbol + " " + content;
	})();

	editor.setLine(cursor.line, newListLine);
	editor.setCursor(cursor.line, cursor.ch + symbol.length + 1);
};

export const indentedQuote = (editor: Editor, view: MarkdownView) => {
	if (!view || view.getMode() == "preview") {
		return;
	}
	const cursor = editor.getCursor();
	const line = editor.getLine(cursor.line);
	const depth = line.length - line.trimStart().length;
	const indent = "\t".repeat(depth + 1);
	const newLine = line + "\n".repeat(2) + indent + "> ";
	editor.setLine(cursor.line, newLine);
	editor.setCursor(cursor.line + 2, depth + 3);
};