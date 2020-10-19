import * as ts                 from "typescript";

/**
 * Name of parameter holding custom State object inside ts.Node object
 */
export const STATE_PROP = "__tstStateProp__";

/**
 * Interface for ts.Node holding state
 */
export interface StateNode extends ts.Node
{
	[STATE_PROP]: State
}

/**
 * State object storing some props on ts.Node
 * If State exists, it mean's node was visited already
 */
export interface State
{
	/**
	 * Names of generic parameters
	 * @description When visiting bodies, names of generic types used in getType() are inserted into this array.
	 * Resetting on method/function declaration.
	 */
	usedGenericParameters?: Array<string>;

	/**
	 * Indexes of generic parameters in declaration
	 */
	indexesOfGenericParameters?: Array<number>;

	/**
	 * Number of declared parameters/expected arguments
	 */
	declaredParametersCount?: number;
}