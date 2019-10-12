wp.customize('site_background_type', val =>
	val.bind(to => {
		document.body.classList.remove('site-has-background-image')
		document.body.classList.remove('site-has-pattern')

		if (to === 'pattern') {
			document.body.classList.add('site-has-pattern')
		}

		if (to === 'image') {
			document.body.classList.add('site-has-background-image')
		}
	})
)

wp.customize('load_more_label', val =>
	val.bind(to => {
		document.querySelector('.ct-load-more').innerHTML = to
	})
)
