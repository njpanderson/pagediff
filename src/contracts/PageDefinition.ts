import Selector from './Selector';
import ReporterOptions from './ReporterOptions';

export default interface PageDefinition {
	title: string,
	link?: string,
	transport: {
		type: string,
		options?: object
	},
	diff?: {
		context?: number
	},
	selectors: Array<Selector>,
	reporters?: ReporterOptions
};
