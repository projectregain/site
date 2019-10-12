import {
	createElement,
	Component,
	createRef,
	Fragment
} from '@wordpress/element'
import classnames from 'classnames'
import linearScale from 'simple-linear-scale'

import OutsideClickHandler from './react-outside-click-handler'

const clamp = (min, max, value) => Math.max(min, Math.min(max, value))

const round = (value, decimalPlaces = 1) => {
	// return Math.round(value)

	const multiplier = Math.pow(10, decimalPlaces)
	const rounded = Math.round(value * multiplier + Number.EPSILON) / multiplier
	return rounded
}

export default class Slider extends Component {
	state = {
		is_dragging: false,
		is_open: false
	}

	el = createRef()

	hasUnitsList = () =>
		this.props.option.units && this.props.option.units.length > 1

	getAllowedDecimalPlaces = (properUnit = null) => {
		const decimals = this.props.option.units
			? this.props.option.units.find(
					({ unit }) => unit === (properUnit || this.getCurrentUnit())
			  ).decimals
			: this.props.option.decimals

		return decimals !== 0 && !decimals ? 0 : decimals
	}

	withDefault = (currentUnit, defaultUnit) =>
		this.props.option.units
			? this.props.option.units.find(({ unit }) => unit === currentUnit)
				? currentUnit
				: currentUnit || defaultUnit
			: currentUnit || defaultUnit

	getCurrentUnit = () =>
		this.props.option.units
			? this.withDefault(
					this.props.value
						.toString()
						.replace(/[0-9]/g, '')
						.replace(/\./g, ''),
					this.props.option.units[0].unit
			  )
			: ''

	getMax = () =>
		this.props.option.units
			? this.props.option.units.find(
					({ unit }) => unit === this.getCurrentUnit()
			  ).max
			: this.props.option.max

	getMin = () =>
		this.props.option.units
			? this.props.option.units.find(
					({ unit }) => unit === this.getCurrentUnit()
			  ).min
			: this.props.option.min

	getNumericValue = () => parseFloat(this.props.value, 10)

	computeAndSendNewValue({ pageX }) {
		let { top, left, width } = this.el.current.getBoundingClientRect()

		this.props.onChange(
			`${round(
				linearScale(
					[0, width],
					[
						parseFloat(this.getMin(), 10),
						parseFloat(this.getMax(), 10)
					],
					true
				)(pageX - left - pageXOffset),
				this.getAllowedDecimalPlaces()
			)}${this.getCurrentUnit()}`
		)
	}

	handleMove = event => {
		if (!this.state.is_dragging) return
		this.computeAndSendNewValue(event)
	}

	handleUp = () => {
		this.setState({
			is_dragging: false
		})

		this.detachEvents()
	}

	attachEvents() {
		document.documentElement.addEventListener(
			'mousemove',
			this.handleMove,
			true
		)

		document.documentElement.addEventListener(
			'mouseup',
			this.handleUp,
			true
		)
	}

	detachEvents() {
		document.documentElement.removeEventListener(
			'mousemove',
			this.handleMove,
			true
		)

		document.documentElement.removeEventListener(
			'mouseup',
			this.handleUp,
			true
		)
	}

	render() {
		const leftValue = `${linearScale(
			[parseFloat(this.getMin(), 10), parseFloat(this.getMax(), 10)],
			[0, 100]
		)(
			clamp(
				parseFloat(this.getMin(), 10),
				parseFloat(this.getMax(), 10),
				parseFloat(this.getNumericValue(), 10)
			)
		)}`

		return (
			<div className="ct-option-slider">
				{this.props.beforeOption && this.props.beforeOption()}

				<div
					onMouseDown={({ pageX, pageY }) => {
						this.attachEvents()
						this.setState({ is_dragging: true })
					}}
					onClick={e => this.computeAndSendNewValue(e)}
					ref={this.el}
					className="ct-slider"
					{...(this.props.option.steps
						? { ['data-steps']: '' }
						: {})}>
					<div style={{ width: `${leftValue}%` }} />
					<span
						style={{
							left: `${leftValue}%`
						}}
					/>

					{this.props.option.steps && (
						<section className={this.props.option.steps}>
							<i className="minus"></i>
							<i className="zero"></i>
							<i className="plus"></i>
						</section>
					)}
				</div>

				{!this.props.option.skipInput && (
					<div
						className={classnames('ct-slider-input', {
							// ['ct-unit-changer']: !!this.props.option.units,
							['ct-value-changer']: true,
							'no-unit-list': !this.hasUnitsList(),
							active: this.state.is_open
						})}>
						<input
							type="number"
							{...(this.props.option.ref
								? { ref: this.props.option.ref }
								: {})}
							step={
								1 / Math.pow(10, this.getAllowedDecimalPlaces())
							}
							value={this.getNumericValue()}
							onBlur={() =>
								this.props.onChange(
									`${clamp(
										parseFloat(this.getMin(), 10),
										parseFloat(this.getMax(), 10),
										parseFloat(this.getNumericValue(), 10)
									)}${this.getCurrentUnit()}`
								)
							}
							onChange={({ target: { value } }) =>
								this.props.onChange(
									`${value ||
										this.getMin()}${this.getCurrentUnit()}`
								)
							}
						/>

						<span className="ct-value-divider"></span>

						{!this.hasUnitsList() && (
							<span className="ct-current-value">
								{this.withDefault(
									this.getCurrentUnit(),
									this.props.option.defaultUnit || 'px'
								)}
							</span>
						)}

						{this.hasUnitsList() && (
							<Fragment>
								<span
									onClick={() =>
										this.setState({
											is_open: !this.state.is_open
										})
									}
									className="ct-current-value">
									{this.getCurrentUnit() || '―'}
								</span>

								<OutsideClickHandler
									onOutsideClick={() => {
										if (!this.state.is_open) {
											return
										}

										this.setState({ is_open: false })
									}}>
									<ul className="ct-units-list">
										{this.props.option.units
											.filter(
												({ unit }) =>
													unit !==
													this.getCurrentUnit()
											)

											.reduce(
												(current, el, index) => [
													...current.slice(
														0,
														index % 2 === 0
															? undefined
															: -1
													),
													...(index % 2 === 0
														? [[el]]
														: [
																[
																	current[
																		current.length -
																			1
																	][0],
																	el
																]
														  ])
												],
												[]
											)

											.map(group => (
												<li key={group[0].unit}>
													{group.map(({ unit }) => (
														<span
															key={unit}
															onClick={() => {
																this.props.onChange(
																	`${round(
																		clamp(
																			this.props.option.units.find(
																				({
																					unit: u
																				}) =>
																					u ===
																					unit
																			)
																				.min,
																			this.props.option.units.find(
																				({
																					unit: u
																				}) =>
																					u ===
																					unit
																			)
																				.max,
																			parseFloat(
																				this.getNumericValue(),
																				10
																			)
																		),
																		this.getAllowedDecimalPlaces(
																			unit
																		)
																	)}${unit}`
																)
																this.setState({
																	is_open: false
																})
															}}>
															{unit || '―'}
														</span>
													))}
												</li>
											))}
									</ul>
								</OutsideClickHandler>
							</Fragment>
						)}
					</div>
				)}
			</div>
		)
	}
}
