import { Editor, MarkdownView } from "obsidian";

export const nestedQuote = (editor: Editor, view: MarkdownView) => {
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
