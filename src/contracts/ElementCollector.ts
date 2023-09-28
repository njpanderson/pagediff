import CollectedElementData from "./CollectedElementData";
import Collector from "@lib/Collector";

export default interface ElementCollector {
	(element: Element, collector: Collector): CollectedElementData,
}
