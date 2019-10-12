import { createElement, useContext } from '@wordpress/element'
import cls from 'classnames'
import Sortable from './Sortable'
import { DragDropContext } from '../../../options/options/ct-header-builder'
import { PanelContext } from '../../../options/components/PanelLevel'

const isItemAllowedIn = (itemId, barId) => {
	const item = ct_customizer_localizations.header_builder_data.header.find(
		({ id }) => id === itemId
	)

	if (!item) {
		return true
	}

	const allowedRespected =
		item.config.allowed_in.length > 0
			? item.config.allowed_in.indexOf(barId) > -1
			: true

	const exclusionRespected =
		item.config.excluded_from.length > 0
			? item.config.excluded_from.indexOf(barId) === -1
			: true

	return allowedRespected && exclusionRespected
}

const shallowCompare = (prev, next) => {
	for (let key in next) {
		if (next[key] !== prev[key]) return false
	}
	return true
}
function memo(Component, areEqual = shallowCompare) {
	let prevProps = {}
	let prevResult
	return nextProps => {
		if (prevResult !== undefined && areEqual(prevProps, nextProps)) {
			return prevResult
		}
		prevProps = nextProps
		prevResult = createElement(Component, Object.assign({}, nextProps))
		return prevResult
	}
}

export const DraggableItem = memo(
	({ item, index, panelType, onRemove, renderItem, onClick, className }) => {
		const itemData = ct_customizer_localizations.header_builder_data[
			panelType
		].find(({ id }) => id === item)

		if (renderItem) {
			return renderItem({ item, itemData })
		}

		return (
			<div
				data-id={item}
				className={cls('ct-builder-item', className, {
					// 'ct-is-dragging': snapshot.isDragging
				})}
				onClick={onClick}>
				{itemData.config.name}

				<button
					className="ct-btn-remove"
					onClick={e => {
						e.preventDefault()
						e.stopPropagation()
						onRemove()
					}}></button>
			</div>
		)
	}
)

const DraggableItems = ({
	items,
	draggableId,
	hasPointers = true,
	className,
	tagName = 'div',
	direction = 'horizontal',
	group = 'header_sortables',
	options = {},
	propsForItem = item => ({}),
	...props
}) => {
	const {
		isDragging,
		setIsDragging,
		onChange,
		setList,
		builderValueDispatch
	} = useContext(DragDropContext)

	const { panelsHelpers } = useContext(PanelContext)

	return (
		<Sortable
			options={{
				delay: 0,
				group,
				fallbackOnBody: true,
				forceFallback: true,
				fallbackTolerance: 5,
				filter: '.ct-pointer',
				direction: direction,
				touchStartThreshold: 5,
				onStart: function(event) {
					setIsDragging(event.item.dataset.id)
					if (isItemAllowedIn(event.item.dataset.id, 'middle-row')) {
						document.body.classList.add('ct-builder-dragging')
					}

					if (event.from && group && group.pull !== 'clone') {
						event.to.classList.add('ct-is-over')
					}
				},

				onEnd: () => {
					setIsDragging(false)
					document.body.classList.remove('ct-builder-dragging')
					;[
						...document.querySelectorAll(
							'.ct-panel-builder .ct-is-over'
						)
					].map(el => el.classList.remove('ct-is-over'))
				},

				onMove: (event, originalEvent) => {
					if (event.from.closest('#ct-option-header-builder-items')) {
						Promise.resolve().then(() =>
							[
								...event.from.querySelectorAll(
									`[data-id="${event.dragged.dataset.id}"]`
								)
							].map(el => {
								el.classList.remove('ct-builder-item')
								el.classList.add('ct-item-in-builder')
							})
						)
					}

					;[
						...document.querySelectorAll(
							'.ct-panel-builder .ct-is-over'
						)
					].map(el => el.classList.remove('ct-is-over'))

					if (event.to) {
						event.to.classList.add('ct-is-over')
					}

					if (
						!isItemAllowedIn(
							event.dragged.dataset.id,
							event.to.dataset.id.split(':')[0]
						)
					) {
						return false
					}
				},
				...options
			}}
			onChange={(order, sortable, evt) => {
				if (draggableId === 'available-items') {
					return
				}

				onChange({
					id: draggableId,
					value: order.filter(
						i => i !== '__pointer__' && i !== '__filler__'
					)
				})
			}}
			tag={tagName}
			className={cls('ct-builder-items', className)}
			{...props}
			data-id={draggableId}>
			{['end', 'start-middle'].indexOf(draggableId.split(':')[1]) >
				-1 && <div data-id="__filler__" className="ct-filler"></div>}

			{hasPointers &&
				isDragging &&
				isItemAllowedIn(isDragging, draggableId.split(':')[0]) && (
					<div data-id="__pointer__" className="ct-pointer"></div>
				)}

			{items.map((item, index) => (
				<DraggableItem
					key={item}
					index={index}
					panelType={'header'}
					item={item}
					className={
						panelsHelpers.isOpenFor(`builder_panel_${item}`)
							? 'ct-customizing'
							: ''
					}
					onClick={e => {
						e.stopPropagation()
						e.preventDefault()

						panelsHelpers.open(`builder_panel_${item}`)
					}}
					onRemove={() => {
						panelsHelpers.close()

						setList({
							[draggableId]: items.filter(id => id !== item)
						})

						builderValueDispatch({
							type: 'REMOVE_ITEM',
							payload: {
								id: item
							}
						})
					}}
					{...propsForItem(item)}
				/>
			))}
		</Sortable>
	)
}

export default DraggableItems
