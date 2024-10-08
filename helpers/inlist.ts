import { Editor, MarkdownView } from "obsidian";

class EditorLine {
	private readonly listSymbols: string[] = ["- ", "+ ", "* "];
	private readonly text: string;
	private readonly content: string;
	private readonly symbol: string;
	constructor(s: string, symbol: string) {
		this.text = s;
		this.symbol = symbol;
		this.content = this.text.trimStart();
	}

	private get indent(): string {
		const n = this.text.length - this.content.length;
		return this.content.substring(0, n);
	}

	private isList(): boolean {
		return this.listSymbols.includes(this.content.substring(0, 2));
	}

	format(): string {
		if (!this.isList()) {
			return (
				this.indent +
				this.listSymbols[0] +
				this.symbol +
				" " +
				this.content
			);
		}
		return (
			this.indent +
			this.content.substring(0, 2) +
			this.symbol +
			" " +
			this.content.substring(2)
		);
	}
}

export const addSymbol = (
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
	const el = new EditorLine(line, symbol);
	const newLine = el.format();
	editor.setLine(cursor.line, newLine);
	editor.setCursor(cursor.line, cursor.ch + symbol.length + 1);
};
