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
};

export const ListSymbols = ["- ", "+ ", "* "];

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
		const indent = line.substring(0, line.length - line.trimStart().length);
		const content = line.trimStart();
		// if line is already list
		if (ListSymbols.includes(content.substring(0, 2))) {
			return (
				indent +
				content.substring(0, 2) +
				symbol +
				" " +
				content.substring(2)
			);
		}
		return indent + ListSymbols[0] + symbol + " " + content;
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

export class NestedCircumfix {
	private pairs: [[string, string], [string, string]];

	constructor(
		prime_pair: [string, string],
		secondory_pair: [string, string]
	) {
		this.pairs = [prime_pair, secondory_pair];
	}

	fix(s: string): string {
		const stack: number[] = [];
		const result: string[] = Array.from(s);
		const [openChar, closeChar] = this.pairs[0];

		for (let i = 0; i < s.length; i++) {
			const char = s[i];
			if (char === openChar) {
				stack.push(i);
			} else if (char === closeChar) {
				if (stack.length > 0) {
					const start = stack.pop()!;
					const depth = stack.length;
					const [left, right] = this.pairs[depth % 2];
					result[start] = left;
					result[i] = right;
				}
			}
		}

		return result.join("");
	}
}

const getFrontmatterShortestAlias = (app: App): string => {
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView) return "";
	const activeFile = activeView.file;
	if (!activeFile) return "";
	const cache = app.metadataCache.getFileCache(activeFile);
	if (!cache) return "";
	const frontmatter = cache.frontmatter;
	if (!frontmatter || !frontmatter.aliases) return "";
	const aliases = frontmatter.aliases;
	const arr = Array.isArray(aliases)
		? aliases.filter(Boolean)
		: aliases.split(",").map((a: string) => a.trim());
	return arr
		.filter((a: string) => 0 < a.trim().length)
		.sort((a: string, b: string) => a.length - b.length)[0];
};

export const dokuryoSection = (
	app: App,
	editor: Editor,
	view: MarkdownView
) => {
	if (view.getMode() == "preview") {
		return;
	}
	const bookTitle = getFrontmatterShortestAlias(app);
	const lines = [
		"",
		"---",
		"",
		"`#読了`",
		"",
		"```",
		`『${bookTitle}』 #読了`,
		"",
		"```",
		"",
	];
	const cursorIdx = lines
		.map((line, i) => {
			if (line.startsWith("『")) {
				return i;
			}
			return -1;
		})
		.filter((i) => -1 < i)[0];
	const cursor = editor.getCursor();
	editor.setLine(cursor.line, lines.join("\n"));
	editor.setCursor(cursor.line + cursorIdx, bookTitle.length + 1);
};
