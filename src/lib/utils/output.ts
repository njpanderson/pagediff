import config from './config';

class Output {
	write(...args: string[]) {
		if (!config.get('verbose'))
			return;

		console.log.apply(console, [...args]);
	}
}

export default (new Output());
