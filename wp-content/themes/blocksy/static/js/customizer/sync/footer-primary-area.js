import { getCache } from './helpers'

const renderColumn = number => {
	const kind =
		wp.customize(`footer_section_${number}`)() ||
		(number === '1' ? 'footer_menu' : 'social_icons')

	if (kind === 'disabled') {
		return
	}

	const newHtml = getCache().querySelector(
		`.ct-customizer-preview-cache [data-id="${
			{
				footer_menu: 'footer-main-area-menu',
				custom_text: 'footer-main-area-text',
				social_icons: 'footer-main-area-socials'
			}[kind]
		}"]`
	).innerHTML

	const e = document.createElement('div')
	e.innerHTML = newHtml

	if (kind === 'custom_text') {
		e.querySelector('.ct-custom-text').innerHTML =
			wp.customize(`section_${number}_text`)() || 'Sample text'
	}

	if (kind === 'social_icons') {
		const cache = document.createElement('div')
		cache.innerHTML = e.querySelector('.ct-social-box').innerHTML

		e.querySelector('.ct-social-box').innerHTML = ''

		wp.customize(`footer_socials_${number}`)().map(({ id, enabled }) => {
			if (!enabled) return

			e.querySelector('.ct-social-box').appendChild(
				cache.querySelector(`[data-network=${id}]`)
			)
		})
	}

	while (e.firstElementChild) {
		document
			.querySelector('.footer-primary-area .grid-columns')
			.appendChild(e.firstElementChild)
	}
}

const renderPrimaryArea = () => {
	if (document.querySelector('.site-footer .footer-primary-area')) {
		document
			.querySelector('.site-footer .footer-primary-area')
			.parentNode.removeChild(
				document.querySelector('.site-footer .footer-primary-area')
			)
	}

	if ((wp.customize('has_primary_area')() || 'yes') !== 'yes') {
		return
	}

	const newHtml = getCache().querySelector(
		`.ct-customizer-preview-cache [data-id="footer-main-area-wrapper"]`
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

	const primaryArea = document.querySelector(
		'.site-footer .footer-primary-area'
	)

	primaryArea.querySelector('.grid-columns').removeAttribute('data-columns')

	if (
		(wp.customize('footer_section_1')() || 'footer_menu') !== 'disabled' &&
		(wp.customize('footer_section_2')() || 'social_icons') !== 'disabled'
	) {
		primaryArea.querySelector('.grid-columns').dataset.columns = 2
	} else {
		if (
			(wp.customize('footer_section_1')() || 'footer_menu') !==
				'disabled' ||
			(wp.customize('footer_section_2')() || 'social_icons') !==
				'disabled'
		) {
			primaryArea.querySelector('.grid-columns').dataset.columns = 1
		}
	}

	primaryArea.querySelector('.grid-columns').innerHTML = ''

	renderColumn('1')
	renderColumn('2')
}

wp.customize('has_primary_area', val => val.bind(to => renderPrimaryArea()))
wp.customize('footer_section_1', val => val.bind(to => renderPrimaryArea()))
wp.customize('footer_section_2', val => val.bind(to => renderPrimaryArea()))
wp.customize('section_1_text', val => val.bind(to => renderPrimaryArea()))
wp.customize('section_2_text', val => val.bind(to => renderPrimaryArea()))
wp.customize('footer_socials_1', val => val.bind(to => renderPrimaryArea()))
wp.customize('footer_socials_2', val => val.bind(to => renderPrimaryArea()))
