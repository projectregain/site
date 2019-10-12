import { render, createElement } from '@wordpress/element'

const buildersMaps = {
	header: {
		panelType: 'header',
		customizerFieldKey: 'header_placements'
	},

	footer: {
		panelType: 'footer',
		customizerFieldKey: 'footer_placements'
	}
}

const openBuilderFor = key => {
	if (key !== 'header') {
		return
	}

	document.querySelector('.wp-full-overlay').classList.add('ct-show-builder')
}

const closeBuilderFor = key => {
	document
		.querySelector('.wp-full-overlay')
		.classList.remove('ct-show-builder')
}

export const initBuilder = () => {
	const root = document.createElement('div')
	root.classList.add('ct-panel-builder')

	document.querySelector('.wp-full-overlay').appendChild(root)

	Object.keys(buildersMaps).map(singleKey =>
		(wp.customize.panel(singleKey)
			? wp.customize.panel
			: wp.customize.section)(singleKey, section =>
			section.expanded.bind(value =>
				value ? openBuilderFor(singleKey) : closeBuilderFor(singleKey)
			)
		)
	)
}
