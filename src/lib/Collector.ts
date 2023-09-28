import { JSDOM, VirtualConsole } from 'jsdom';
import { diffLines } from 'diff';
import { dump as dumpYaml } from 'js-yaml';

import PageDefinition from '@contracts/PageDefinition';
import Cache from '@contracts/Cache';
import Reporter from '@contracts/Reporter';
import cache from '@lib/cache';
import Diff from './models/Diff';

// Transports
import HttpTransport from '@lib/transport/Http';

// Reporters
import ConsoleReporter from '@lib/reporters/Console';
import EmailReporter from '@lib/reporters/Email';
import TransportResponse from '@contracts/TransportResponse';

const transports: {[index: string]:any} = {
	Http: HttpTransport
};

const reporters: {[index: string]:any} = {
	console: ConsoleReporter,
	email: EmailReporter,
};

export default class Collector {
	private pages: Array<PageDefinition> = [];
	private reporter: string;
	private cache: Cache;
	private virtualConsole: VirtualConsole;

	constructor(reporter: string) {
		this.cache = cache('Collector');
		this.reporter = this.getReporterClassName(reporter);

		this.virtualConsole = this.createVirtualConsole();
	}

	addPages(definitions: Array<PageDefinition>) {
		this.pages = this.pages.concat(
			this.pages,
			definitions
		);
	}

	async run(): Promise<void> {
		let page: PageDefinition;

		const deltas: {[index: string]:any} = {};
		const reports: Array<any> = [];

		if (!(page = this.pages.splice(0, 1)[0])) {
			console.log('\nNo pages left. All done!');
			return;
		}

		const reporter = this.getReporterInstance(page);

		console.log(`\nRunning page ${page.title}...`);

		const transport = new transports[page.transport.type](
			page.transport.options
		);

		page.selectors.forEach(async (pageSelector) => {
			const hash = this.cache.getHash(page.title + pageSelector.title);
			const cached = this.cache.getKey(hash);

			let dom: JSDOM = new JSDOM();
			let response: TransportResponse = { data: null, page: 0 };

			// Collect deltas
			do {
				let lastFetchData: object|undefined = {};

				try {
					response = await transport.fetch(dom, lastFetchData);
					lastFetchData = response?.lastFetchData;
				} catch(error) {
					reporter.error(error);
				}

				if (response.data) {
					dom = new JSDOM(response.data.toString(), {
						pretendToBeVisual: true,
						virtualConsole: this.virtualConsole
					});

					const elements = dom.window.document.querySelectorAll(pageSelector.selector);

					if (!deltas[hash])
						deltas[hash] = [];

					deltas[hash] = deltas[hash].concat(
						[...elements].map(element => (
							pageSelector.collector(element, this)
						))
					);

					console.log(`${elements.length} deltas found for selector ${
						pageSelector.title
					} (page ${response.page}).`);
				}
			} while(response.data !== null)

			// Sort deltas based on ordered attribute
			if (pageSelector.sortBy) {
				// Sort by sortBy property
				this.sortByAttribute(deltas[hash], pageSelector.sortBy);
			}

			if (pageSelector.sorter) {
				// Sort by custom function
				deltas[hash].sort(pageSelector.sorter);
			}

			const deltasYaml = dumpYaml(deltas);

			// Cache next deltas
			this.cache.setKey(hash, deltasYaml);

			// Compare deltas with cached
			const diff = diffLines(
				cached || '',
				deltasYaml
			);

			reports.push(reporter.report(page, pageSelector, new Diff(diff)));

			return Promise.all(reports).then(() => {
				console.log('\nReports all run!');
				this.run();
			});
		});
	}

	textFrom(element: Element|null, selector: string): string {
		if (element === null)
			return '';

		element = element.querySelector(selector);

		if (!element || element === null || !element.textContent)
			return '';

		return (element.textContent.trim());
	}

	private sortByAttribute(deltas: Array<any>, sortBy: string) {
		deltas.sort((a: any, b: any): number => {
			const propA = a[sortBy].toUpperCase();
			const propB = b[sortBy].toUpperCase();

			if (propA < propB)
				return -1;

			if (propA > propB)
				return 1;

			return 0;
		});
	}

	private createVirtualConsole(): VirtualConsole {
		const virtualConsole = new VirtualConsole();

		virtualConsole.sendTo(console, { omitJSDOMErrors: true });

		virtualConsole.on("jsdomError", (err) => {
			if (err.message !== "Could not parse CSS stylesheet") {
				console.error(err);
			}
		});

		return virtualConsole;
	}

	private getReporterClassName(reporter: string): string {
		switch (reporter) {
		case 'email':
			return 'email'

		case 'console':
		default:
			return 'console';
		}
	}

	private getReporterInstance(page: PageDefinition) {
		if (page.reporters && page.reporters[this.reporter]) {
			// Return existing reporter class
			return page.reporters[this.reporter];
		}

		return new reporters[this.reporter]();
	}
}
