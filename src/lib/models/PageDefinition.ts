import Contract from '@contracts/PageDefinition';

export default class PageDefinition {
	public data: Contract;

	constructor(data: Contract) {
		this.data = {
			diff: {
				context: 5,
				...data.diff
			},
			...data
		};
	}

	get title() {
		return this.data.title;
	}

	get transport() {
		return this.data.transport;
	}

	get selectors() {
		return this.data.selectors;
	}

	get reporters() {
		return this.data.reporters;
	}

	get link() {
		return this.data.link;
	}

	get diff() {
		return this.data.diff;
	}
}
