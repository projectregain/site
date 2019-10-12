import { createElement, Component } from '@wordpress/element'
import classnames from 'classnames'

const Switch = ({ value, option, onChange, onClick }) => (
	<div
		className={classnames({
			[`ct-option-switch`]: true,
			[`ct-active`]: value === 'yes'
		})}
		onClick={e => {
			onClick && onClick(e)
			onChange(value === 'yes' ? 'no' : 'yes')
		}}>
		<span />
	</div>
)

Switch.renderingConfig = {
	design: 'inline'
}

export default Switch
