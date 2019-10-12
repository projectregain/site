import {
  Fragment,
  createElement,
  createContext,
  createPortal,
  useMemo,
  useState,
  useReducer,
  useCallback
} from '@wordpress/element'

const panelsReducer = (state, action) => {
  if (action.type === 'PANEL_OPEN') {
    const { panelId } = action.payload

    return {
      ...state,
      panelIsOpen: panelId,
      panelIsTransitioning: panelId
    }
  }

  if (action.type === 'PANEL_CLOSE') {
    return {
      ...state,
      panelIsOpen: false
    }
  }

  if (action.type === 'PANEL_FINISH_TRANSITIONING') {
    return {
      ...state,
      panelIsTransitioning: false
    }
  }

  return state
}

export const usePanelsManager = () => {
  const [state, dispatch] = useReducer(panelsReducer, {
    panelIsOpen: false,
    panelIsTransitioning: false
  })

  return [
    state,
    {
      open: panelId =>
        dispatch({
          type: 'PANEL_OPEN',
          payload: { panelId }
        }),
      close: () =>
        dispatch({
          type: 'PANEL_CLOSE'
        }),
      stopTransitioning: () => {
        dispatch({
          type: 'PANEL_FINISH_TRANSITIONING'
        })
      }
    }
  ]
}
