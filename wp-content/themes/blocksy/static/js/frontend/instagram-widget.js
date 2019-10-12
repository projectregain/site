import ctEvents from 'ct-events'
import { markImagesAsLoaded } from './lazy-load-helpers'

export const initInstagramWidget = el => {
	if (!el.querySelector('ul[data-widget]')) {
		markImagesAsLoaded(el.querySelector('ul'))
		return
	}

	if (!window.fetch) return

	const { limit, username } = JSON.parse(
		el.querySelector('ul').dataset.widget
	)

	el.querySelector('ul').removeAttribute('data-widget')

	fetch(
		`${
			ct_localizations.ajax_url
		}?action=ct_widget_instagram&limit=${limit}&username=${username}`
	)
		.then(r => r.text())
		.then(text => {
			el.querySelector('ul').removeAttribute('class')
			el.querySelector('ul').innerHTML = text
			ctEvents.trigger('ct:images:lazyload:update')
		})
}
