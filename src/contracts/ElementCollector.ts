import Collector from "@lib/Collector";

export default interface ElementCollector {
	(element: Element, collector: Collector): object,
}
