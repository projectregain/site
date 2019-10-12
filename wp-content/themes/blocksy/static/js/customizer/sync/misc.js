wp.customize('has_passepartout', val =>
  val.bind(to => {
    document.body.classList.remove('ct-passepartout')

    if (to === 'yes') {
      document.body.classList.add('ct-passepartout')
    }
  })
)

wp.customize('forms_type', val =>
  val.bind(to => {
    document.body.classList.remove('ct-classic-forms', 'ct-modern-forms')

    to !== 'ct-classic-forms' && document.body.classList.add(`ct-${to}`)
  })
)
