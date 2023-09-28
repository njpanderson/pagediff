import * as path from 'path';
import minimist from 'minimist';
import { glob } from 'glob';

import PageDefinition from '@contracts/PageDefinition';
import Collector from '@lib/Collector';

export default class App {
	private collector: Collector|undefined;

	private args: any;

	constructor(args: any) {
		this.args = this.parseArgs(args);

		if (this.args === null) {
			// Short circuit to help
			this.writeHelp();
			return;
		}

		this.collector = new Collector(this.args.reporter);

		this.parsePages()
			.then(this.run.bind(this));
	}

	writeHelp() {
		console.log([
			'PageDiff 👻',
			'This tool will check for the difference in page content between each run',
			'',
			'Arguments:',
			' -h --help          Show this help.',
			' --in <path>        Path to find page definitions in js/ts format.',
			' --reporter [cli]   Reporter to use. Choose between: email, cli.'
		].join('\n'));
	}

	parseArgs(args: any): object|null {
		args = minimist(args);

		if (!args.in || (args.h || args.help))
			return null;

		if (args.in)
			args.in = path.resolve(args.in);

		return args;

	}

	async parsePages() {
		const files = await glob('**/*.{ts,js}', {
			cwd: this.args.in
		});

		const pageDefinitions: Array<PageDefinition> = [];

		files.forEach((file: string) => {
			pageDefinitions.push(
				require(path.join(this.args.in, file)).default
			);
		});

		return pageDefinitions;
	}

	async run(pageDefinitions: Array<PageDefinition>) {
		if (!this.collector)
			throw new Error('Collector not initialised. Was it defined correctly?');

		this.collector.addPages(pageDefinitions);
		this.collector.run();
	}
};
