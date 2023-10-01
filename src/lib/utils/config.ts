import * as path from 'path';
import minimist from 'minimist';

class Config {
	private args: any;

	constructor() {
		this.args = this.parseArgs(process.argv.slice(2));
	}

	parseArgs(args: any): object|null {
		args = minimist(args, {
			boolean: [
				'h',
				'v'
			],
			string: [
				'in',
				'reporter'
			],
			alias: {
				'h': ['help'],
				'v': ['verbose']
			}
		});

		if (args.in)
			args.in = path.resolve(args.in);

		return args;
	}

	/**
	 * Return whether the config has the current argument. In the case that the
	 * argument is boolean, will also only return if it is true.
	 * @param arg
	 */
	has(arg: string) {
		if (!this.args[arg])
			return false;

		return true;
	}

	get(arg: string, defaultValue: any = null) {
		return (this.args && this.args[arg] ? this.args[arg] : defaultValue);
	}

	isEmpty() {
		return this.args === null;
	}
}

export default (new Config());
