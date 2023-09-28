import chalk from 'chalk';

import Base from 'base/Reporter';
import Reporter from "@contracts/Reporter";
import PageDefinition from '@contracts/PageDefinition';
import Selector from '@contracts/Selector';
import Diff from '@lib/models/Diff';

interface ConsoleOptions {
	prefix?: string
};

export default class Console extends Base implements Reporter {
	protected options = {
		prefix: ''
	};

	constructor(options: ConsoleOptions) {
		super();
		this.setOptions(options);
	}

	async report(page: PageDefinition, selector: Selector, diff: Diff): Promise<any> {
		const label = `${chalk.yellow(page.title)} / ${chalk.yellow(selector.title)}`;

		if (!diff.count) {
			process.stdout.write(`No changes in ${label}\n`);
			return;
		} else {
			process.stdout.write(`${diff.count} change(s) detected in ${label}\n`);
		}

		diff.getData(page.diff?.context).forEach((part) => {
			const prefix = part.added ? '+' :
				part.removed ? '-' : ' ';

			const color = part.added ? 'green' :
				part.removed ? 'red' : 'grey';

			if (part.value) {
				const lines = part.value.replace(/\n$/, '').split('\n');

				lines.forEach((line) => {
					line = this.options.prefix +
						chalk[color](prefix + '| ' + line + '\n');

					if (selector.highlights)
						line = this.setHighlights(line, selector.highlights);

					process.stdout.write(line);
				})
			}
		});
	}

	private setHighlights(line: string, highlights: Array<string>): string {
		highlights.forEach((highlight: string) => {
			line = line.replace(
				new RegExp(highlight, 'ig'),
				chalk.bgYellow(highlight)
			);
		});

		return line;
	}

	error(error: Error): void {
		console.error(error);
	}
}
