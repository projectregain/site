import { createElement } from '@wordpress/element'
import cls from 'classnames'
import { __ } from 'ct-i18n'

const ViewSwitch = ({ currentView, setCurrentView }) => (
	<ul className="ct-view-switch">
		{['desktop', 'mobile'].map(view => (
			<li
				key={view}
				onClick={() => setCurrentView(view)}
				className={cls({
					active: currentView === view
				})}>
				{
					{
						desktop: __('Desktop Header', 'blocksy'),
						mobile: __('Mobile Header', 'blocksy')
					}[view]
				}
			</li>
		))}
	</ul>
)

export default ViewSwitch
