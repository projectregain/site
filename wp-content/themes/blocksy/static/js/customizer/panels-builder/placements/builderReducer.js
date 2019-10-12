export const builderReducer = (
	{ __should_refresh__, ...builderValue },
	action
) => {
	if (!action.onBuilderValueChange) {
		throw new Error('When you dispatch pass onBuilderValueChange fn.')
	}

	let updatedGlobalState = {}

	let futureBuilderValue = builderValue.sections.find(
		({ id }) => id === builderValue.current_section
	)

	let shouldUpdate = false
	let updateItemId = false

	if (action.type === 'ITEM_VALUE_ON_CHANGE') {
		const {
			id,
			optionId,
			optionValue,
			values = {},
			silent
		} = action.payload

		updateItemId = `${id}:${optionId}`

		let items = futureBuilderValue.items

		if (!silent) {
			wp.customize.previewer &&
				wp.customize.previewer.send('ct:header:receive-value-update', {
					itemId: id,
					optionId,
					optionValue,
					values: {
						...(
							items.find(({ id: _id }) => id === _id) || {
								values: {}
							}
						).values,
						...values,
						[optionId]: optionValue
					}
				})
		}

		if (!items.find(({ id: _id }) => _id === id)) {
			items = [
				...items,
				{
					id,
					values: {}
				}
			]
		}

		futureBuilderValue = {
			...futureBuilderValue,
			items: items.map(item =>
				item.id === id
					? {
							...item,
							values: {
								...item.values,
								...values,
								[optionId]: optionValue
							}
					  }
					: item
			)
		}
	}

	if (action.type === 'PICK_BUILDER_SECTION') {
		shouldUpdate = true
		updatedGlobalState = { current_section: action.payload.id }

		wp.customize.previewer &&
			wp.customize.previewer.send(
				'ct:header:receive-value-update:all-items',
				{
					items: builderValue.sections.find(
						({ id }) => id === action.payload.id
					).items,

					oldItems: builderValue.sections.find(
						({ id }) => id === builderValue.current_section
					).items
				}
			)
	}

	if (action.type === 'REMOVE_ITEM') {
		/*
    shouldUpdate = true
    futureBuilderValue = {
      ...futureBuilderValue,
      items: futureBuilderValue.items.filter(
        ({ id }) => id !== action.payload.id
      )
    }
      */
	}

	if (action.type === 'SET_LIST') {
		shouldUpdate = true
		const { currentView, lists } = action.payload

		futureBuilderValue = {
			...futureBuilderValue,
			[currentView]: futureBuilderValue[currentView].map(
				({ id: barId, placements }) => {
					if (
						placements.find(({ id }) => id === 'middle') &&
						placements.find(({ id }) => id === 'middle').items
							.length === 0 &&
						placements.find(({ id }) => id === 'start-middle') &&
						(placements.find(({ id }) => id === 'start-middle')
							.items.length > 0 ||
							placements.find(({ id }) => id === 'end-middle')
								.items.length > 0)
					) {
						lists[`${barId}:start`] = [
							...(lists[`${barId}:start`] ||
								placements.find(({ id }) => id === 'start')
									.items),
							...(lists[`${barId}:start-middle`] ||
								placements.find(
									({ id }) => id === 'start-middle'
								).items)
						]

						lists[`${barId}:end`] = [
							...(lists[`${barId}:end-middle`] ||
								placements.find(({ id }) => id === 'end-middle')
									.items),
							...(lists[`${barId}:end`] ||
								placements.find(({ id }) => id === 'end').items)
						]

						lists[`${barId}:start-middle`] = []
						lists[`${barId}:end-middle`] = []
					}

					const keys = Object.keys(lists)

					if (keys.map(k => k.split(':')[0]).indexOf(barId) > -1) {
						return {
							id: barId,
							placements: placements.map(({ id, items }) => {
								if (lists[`${barId}:${id}`]) {
									return {
										id,
										items: lists[`${barId}:${id}`]
									}
								}

								return { id, items }
							})
						}
					}

					return {
						id: barId,
						placements
					}
				}
			)
		}
	}

	const actualBuilderValue = {
		...builderValue,
		...updatedGlobalState,
		...(shouldUpdate
			? { __should_refresh__: true }
			: { __should_refresh__: false }),
		__should_refresh_item__: updateItemId,
		sections: builderValue.sections.map(builder =>
			builder.id === futureBuilderValue.id ? futureBuilderValue : builder
		)
	}

	action.onBuilderValueChange(actualBuilderValue)

	return actualBuilderValue
}
