import {
	Fragment,
	createElement,
	Component,
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useState
} from '@wordpress/element'
import classnames from 'classnames'
import TypographyModal from './typography/TypographyModal'
import OutsideClickHandler from './react-outside-click-handler'
import { humanizeVariations } from './typography/helpers'
import { maybePromoteScalarValueIntoResponsive } from '../../customizer/components/responsive-controls'
import { Manager, Reference, Popper } from 'react-popper'

const Typography = ({
	option: { label = '', desc = '', attr = {} },
	option,
	value,
	device,
	onChange
}) => {
	const [isOpen, setIsOpen] = useState(false)

	// options | fonts | variations | search
	const [currentViewCache, setCurrentViewCache] = useState('options:_')

	let [currentView, previousView] = useMemo(
		() => currentViewCache.split(':'),
		[currentViewCache]
	)

	const setCurrentView = useCallback(
		newView => setCurrentViewCache(`${newView}:${currentView}`),
		[currentView]
	)

	return (
		<div
			className={classnames('ct-typography', {
				active: isOpen
			})}>
			<Manager>
				<Reference>
					{({ ref }) => (
						<div
							ref={ref}
							className="ct-typohraphy-value"
							onClick={e => {
								e.preventDefault()
								setCurrentView('options')
								setIsOpen('options')
							}}>
							<div>
								<span
									onClick={e => {
										setCurrentView('fonts')
										setIsOpen('fonts')
										e.stopPropagation()
									}}
									className="ct-font">
									<span>{value.family}</span>
								</span>
								<i>/</i>
								<span
									onClick={e => {
										setCurrentView('options')
										setIsOpen('font_size')
										e.stopPropagation()
									}}
									className="ct-size">
									<span>
										{
											maybePromoteScalarValueIntoResponsive(
												value['size']
											)[device]
										}
									</span>
								</span>
								<i>/</i>
								<span
									onClick={e => {
										setCurrentView('variations')
										setIsOpen('variations')
										e.stopPropagation()
									}}
									className="ct-weight">
									<span>
										{humanizeVariations(value.variation)}
									</span>
								</span>
							</div>

							<a />
						</div>
					)}
				</Reference>

				<OutsideClickHandler
					useCapture={false}
					display="block"
					disabled={!isOpen}
					onOutsideClick={() => setIsOpen(false)}>
					<Popper
						eventsEnabled={isOpen}
						modifiers={{
							preventOverflow: {
								enabled: false
							},

							hide: {
								enabled: false
							}
						}}>
						{({ ref, placement }) => (
							<TypographyModal
								onChange={onChange}
								value={value}
								innerRef={ref}
								placement={placement}
								option={option}
								initialView={isOpen}
								setInititialView={initialView =>
									setIsOpen(initialView)
								}
								currentView={currentView}
								previousView={previousView}
								setCurrentView={setCurrentView}
							/>
						)}
					</Popper>
				</OutsideClickHandler>
			</Manager>
		</div>
	)
}

export default Typography
