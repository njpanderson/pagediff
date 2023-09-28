import ElementCollector from "./ElementCollector"
import ElementSorter from "./ElementSorter"

export default interface Selector {
	selector: string,
	title: string,
	collector: ElementCollector,
	sorter?: ElementSorter,
	sortBy?: string,
	highlights?: Array<string>
}
