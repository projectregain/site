import {
	createElement,
	Component,
	useState,
	useContext,
	Fragment
} from '@wordpress/element'

import cls from 'classnames'
import Panel, { PanelMetaWrapper } from '../../../../options/options/ct-panel'
import { getValueFromInput } from '../../../../options/helpers/get-value-from-input'
import { DragDropContext } from '../../../../options/options/ct-header-builder'

const InvisiblePanels = ({ builderValue, builderValueDispatch }) => {
	const secondaryItems =
		ct_customizer_localizations.header_builder_data.secondary_items.header
	const allItems = ct_customizer_localizations.header_builder_data.header

	const { panelsState, panelsActions } = useContext(DragDropContext)

	const primaryItems = allItems.filter(
		({ id }) => !secondaryItems.find(item => item.id === id)
	)

	return (
		<Fragment>
			{primaryItems.map(primaryItem => {
				const option = {
					label: primaryItem.config.name,
					'inner-options': primaryItem.options
				}

				const id = `builder_panel_${primaryItem.id}`

				return (
					<PanelMetaWrapper
						id={id}
						key={primaryItem.id}
						option={option}
						{...panelsActions}
						getActualOption={({ container }) => (
							<Fragment>
								<Panel
									id={id}
									getValues={() => {
										let itemValue = builderValue.items.find(
											({ id }) => id === primaryItem.id
										)

										if (
											itemValue &&
											Object.keys(itemValue.values) > 5
										) {
											return itemValue.values
										}

										return getValueFromInput(
											primaryItem.options,
											itemValue ? itemValue.values : {}
										)
									}}
									option={option}
									onChangeFor={(optionId, optionValue) => {
										const currentValue = builderValue.items.find(
											({ id }) => id === primaryItem.id
										)

										builderValueDispatch({
											type: 'ITEM_VALUE_ON_CHANGE',
											payload: {
												id: primaryItem.id,
												optionId,
												optionValue,
												values:
													!currentValue ||
													(currentValue &&
														Object.keys(
															currentValue.values
														).length === 0)
														? getValueFromInput(
																primaryItem.options,
																{}
														  )
														: {}
											}
										})
									}}
									view="simple"
								/>
								<div ref={container} />
							</Fragment>
						)}
					/>
				)
			})}
		</Fragment>
	)
}

export default InvisiblePanels
