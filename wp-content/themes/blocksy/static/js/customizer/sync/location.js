const sendLocation = () => {
	setTimeout(() => {
		wp.customize.preview.send(
			'location-change',
			window.ct_localizations.customizer_sync.future_location
		)
	}, 500)
}

wp.customize.bind('ready', () => sendLocation())
wp.customize.bind('preview-ready', () => sendLocation())
