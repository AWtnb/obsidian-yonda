import { Editor, MarkdownView } from "obsidian";

const listSymbols = ["-", "+", "*"].map((c) => c + " ");

const isListLine = (s: string): boolean => {
	const head = s.trimStart().substring(0, 2);
	return listSymbols.includes(head);
};

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
		editor.replaceSelection("- " + symbol);
		return;
	}
	const newLine = (() => {
		if (isListLine(line)) {
			return line.replace(/^\s*./, (m: string): string => {
				return m + " " + symbol;
			});
		}
		return listSymbols[0] + symbol + " " + line;
	})();
	editor.setLine(cursor.line, newLine);
	editor.setCursor(cursor.line, cursor.ch + symbol.length + 1);
};
