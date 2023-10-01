import * as path from 'path';
import { glob } from 'glob';

import config from '@lib/utils/config';
import output from '@lib/utils/output';
import PageDefinition from '@contracts/PageDefinition';
import Collector from '@lib/Collector';

export default class App {
	private collector: Collector|undefined;

	constructor() {
		if (config.isEmpty() || config.has('help')) {
			// Short circuit to help
			this.writeHelp();
			return;
		}

		this.collector = new Collector(config.get('reporter'));

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
			' --reporter [cli]   Reporter to use. Choose between: email, cli.',
			' -v                 Use verbose mode (will write output)'
		].join('\n'));
	}

	async parsePages() {
		const files = await glob('**/*.{ts,js}', {
			cwd: config.get('in')
		});

		const pageDefinitions: Array<PageDefinition> = [];

		files.forEach((file: string) => {
			pageDefinitions.push(
				require(path.join(config.get('in'), file)).default
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
