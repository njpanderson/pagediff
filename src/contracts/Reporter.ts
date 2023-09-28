import PageDefinition from "./PageDefinition";
import Selector from "./Selector";
import Diff from '@lib/models/Diff';

export default interface Reporter {
	report(page: PageDefinition, selector: Selector, diff: Diff): Promise<any>;
	error(error: Error): void;
}
