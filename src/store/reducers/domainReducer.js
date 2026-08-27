/* Domain reducer factory: all resource domains share the same explicit async lifecycle. */
export const initialDomainState = { data: [], loading: false, error: '' };
export const createDomainReducer = (types) => (state = initialDomainState, action) => { switch (action.type) { case types.request: return { ...state, loading: true, error: '' }; case types.success: return { ...state, loading: false, data: action.payload }; case types.failure: return { ...state, loading: false, error: action.payload }; default: return state; } };
