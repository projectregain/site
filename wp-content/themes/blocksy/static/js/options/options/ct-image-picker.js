import { createElement, Component } from '@wordpress/element'
import classnames from 'classnames'

export default class ImagePicker extends Component {
	render() {
		const className = (this.props.option.attr || {}).class

		const attr = { ...(this.props.option.attr || {}) }

		delete attr.class

		return (
			<ul
				{...attr}
				className={classnames('ct-image-picker', className)}
				{...(this.props.option.title ? { 'data-title': '' } : {})}>
				{Object.keys(this.props.option.choices).map(choice => (
					<li
						className={classnames({
							active: choice === this.props.value
						})}
						title={this.props.option.choices[choice].title}
						onClick={() => this.props.onChange(choice)}
						key={choice}>
						{this.props.option.choices[choice].src.indexOf(
							'<svg'
						) === -1 ? (
							<img src={this.props.option.choices[choice].src} />
						) : (
							<span
								dangerouslySetInnerHTML={{
									__html: this.props.option.choices[choice]
										.src
								}}
							/>
						)}

						{this.props.option.title && (
							<span>
								{this.props.option.choices[choice].title}
							</span>
						)}
					</li>
				))}
			</ul>
		)
	}
}

