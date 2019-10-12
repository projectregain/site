import { getCache } from './helpers'
import { markImagesAsLoaded } from '../../frontend/lazy-load-helpers'

export const stackingClassesFor = (
	id,
	el,
	attr = 'stack',
	condition = true
) => {
	el.removeAttribute(
		`data-${attr.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`)}`
	)

	if (!condition) return

	const data = wp.customize(id)() || {
		desktop: true,
		mobile: true,
		tablet: true
	}

	if (data.mobile || data.tablet || data.desktop) {
		el.dataset[attr] = [
			...(data.desktop ? ['desktop'] : []),
			...(data.tablet ? ['tablet'] : []),
			...(data.mobile ? ['mobile'] : [])
		].join(':')
	}
}

export const responsiveClassesFor = (data, el) => {
	el.classList.remove('ct-hidden-sm', 'ct-hidden-md', 'ct-hidden-lg')

	if (typeof data !== 'object') {
		if (!wp.customize(data)) return

		data = wp.customize(data)() || {
			mobile: false,
			tablet: true,
			desktop: true
		}
	}

	if (!data.mobile) {
		el.classList.add('ct-hidden-sm')
	}

	if (!data.tablet) {
		el.classList.add('ct-hidden-md')
	}

	if (!data.desktop) {
		el.classList.add('ct-hidden-lg')
	}
}

const reconstructFooter = () => {
	const footer = document.querySelector('.site-footer .footer-widgets')

	const widgetsArea = document.querySelector(
		'.site-footer .footer-widgets-area'
	)

	if (widgetsArea) {
		widgetsArea.parentNode.removeChild(widgetsArea)
	}

	if ((wp.customize('has_widget_area')() || 'yes') !== 'yes') {
		return
	}

	const newHtml = getCache().querySelector(
		`.ct-customizer-preview-cache [data-id="footer-columns"]`
	).innerHTML

	const e = document.createElement('div')
	e.innerHTML = newHtml

	while (e.firstElementChild) {
		document
			.querySelector('.site-footer')
			.insertBefore(
				e.firstElementChild,
				document.querySelector('.site-footer').firstElementChild
			)
	}

	const to = wp.customize('footer_widgets_structure')() || '3'

	const actualNumber = to.indexOf('-') > -1 ? 3 : parseInt(to, 10)

	let f = document.querySelector('.site-footer .footer-widgets')
	f.dataset.columns = to

	responsiveClassesFor(
		'footer_widgets_visibility',
		document.querySelector('.site-footer .footer-widgets-area')
	)

	Array.from({ length: 4 - actualNumber }, (_, i) => i).map(() =>
		f.removeChild(f.lastElementChild)
	)

	markImagesAsLoaded(document.querySelector('.site-footer'))
	ctEvents.trigger('blocksy:instagram:init')
}

wp.customize('footer_widgets_structure', val =>
	val.bind(to => reconstructFooter())
)
wp.customize('has_widget_area', val => val.bind(to => reconstructFooter()))
wp.customize('footer_widgets_visibility', val =>
	val.bind(to => reconstructFooter())
)

wp.customize('widgetsAreaDivider', val =>
	val.bind(to => {
		if (to.style !== 'none') {
			document.querySelector(
				'.site-footer .footer-widgets'
			).dataset.divider = ''
		} else {
			document
				.querySelector('.site-footer .footer-widgets')
				.removeAttribute('data-divider')
		}
	})
)

const renderCopyright = () => {
	const footer = document.querySelector('.site-footer')

	if (footer.querySelector('.footer-copyright')) {
		footer.removeChild(footer.querySelector('.footer-copyright'))
	}

	if ((wp.customize('has_copyright')() || 'yes') !== 'yes') {
		return
	}

	const newHtml = getCache().querySelector(
		`.ct-customizer-preview-cache [data-id="footer-copyright"]`
	).innerHTML

	const e = document.createElement('div')
	e.innerHTML = newHtml

	while (e.firstElementChild) {
		footer.appendChild(e.firstElementChild)
	}

	document.querySelector(
		'footer .footer-copyright'
	).firstElementChild.innerHTML = wp.customize('copyright_text')()

	responsiveClassesFor(
		'copyright_visibility',
		document.querySelector('footer .footer-copyright')
	)
}

wp.customize('footer_main_area_stacking', val =>
	val.bind(to =>
		stackingClassesFor(
			'footer_main_area_stacking',

			document.querySelector(
				'.site-footer .footer-primary-area .grid-columns'
			)
		)
	)
)

wp.customize('footer_main_area_container', val =>
	val.bind(to => {
		const main = document.querySelector('.site-footer .footer-primary-area')
			.firstElementChild
		main.classList.remove('ct-container', 'ct-container-fluid')

		if (to === 'fixed') {
			main.classList.add('ct-container')
		} else {
			main.classList.add('ct-container-fluid')
		}
	})
)

wp.customize('footer_widgets_container', val =>
	val.bind(to => {
		const main = document.querySelector('.site-footer .footer-widgets-area')
			.firstElementChild
		main.classList.remove('ct-container', 'ct-container-fluid')

		if (to === 'fixed') {
			main.classList.add('ct-container')
		} else {
			main.classList.add('ct-container-fluid')
		}
	})
)

wp.customize('footer_primary_area_visibility', val =>
	val.bind(to => {
		responsiveClassesFor(
			'footer_primary_area_visibility',
			document.querySelector('.site-footer .footer-primary-area')
		)

		ctEvents.trigger('ct:footer-reveal:update')
	})
)

wp.customize('copyright_text', val => val.bind(to => renderCopyright()))
wp.customize('has_copyright', val => val.bind(to => renderCopyright()))
wp.customize('copyright_visibility', val => {
	val.bind(to => renderCopyright())

	ctEvents.trigger('ct:footer-reveal:update')
})
wp.customize('footer_base', val =>
	val.bind(
		to => (document.querySelector('footer.site-footer').dataset.type = to)
	)
)

wp.customize('footer_reveal', val =>
	val.bind(to => {
		const footer = document.querySelector('.site-footer')
		footer.removeAttribute('style')
		footer.removeAttribute('data-footer-reveal')

		if (to !== 'yes') return

		document.body.classList.add('footer-reveal')
		footer.dataset.footerReveal = 'no'

		ctEvents.trigger('ct:footer-reveal:update')
	})
)
