import ctEvents from 'ct-events'

const loadSingleEntryPoint = ({
	els,
	beforeLoad = el => {},
	events = [],
	load,
	mount = ({ mount, el }) => (el ? mount(el) : mount())
}) => {
	const allEls = (Array.isArray(els) ? els : [els]).reduce(
		(a, selector) => [
			...a,
			...(Array.isArray(selector)
				? selector
				: document.querySelectorAll(selector))
		],
		[]
	)

	allEls.map(beforeLoad)

	if (allEls.length === 0) {
		return
	}

	load().then(arg => allEls.map(el => mount({ ...arg, el })))
}

export const onDocumentLoaded = cb => {
	if (/comp|inter|loaded/.test(document.readyState)) {
		cb()
	} else {
		document.addEventListener('DOMContentLoaded', cb, false)
	}
}

export const handleEntryPoints = mountEntryPoints => {
	mountEntryPoints
		.filter(({ onLoad = true }) => !!onLoad)
		.map(loadSingleEntryPoint)
	;[
		...new Set(
			mountEntryPoints.reduce(
				(currentEvents, entry) => [
					...currentEvents,
					...(entry.events || [])
				],
				[]
			)
		)
	].map(distinctEvent =>
		ctEvents.on(distinctEvent, () =>
			mountEntryPoints
				.filter(({ events = [] }) => events.indexOf(distinctEvent) > -1)
				.map(loadSingleEntryPoint)
		)
	)
}
