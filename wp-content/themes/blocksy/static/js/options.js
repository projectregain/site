import './public-path'
import $ from 'jquery'
import { initAllPanels } from './options/initPanels'

if ($ && $.fn) {
  $(document).on('widget-added', () => initAllPanels())
}

document.addEventListener('DOMContentLoaded', () => {
  initAllPanels()
  ;[
    ...document.querySelectorAll('.notice-blocksy-plugin'),
    ...document.querySelectorAll('[data-dismiss]')
  ].map(el => import('./notification/main').then(({ mount }) => mount(el)))
})
