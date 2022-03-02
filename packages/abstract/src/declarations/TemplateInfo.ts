export class TemplateInfo
{
	public readonly head: string;
	public readonly templateSpans: Array<{ expression: string, literal: string }>;

	/**
	 * @param initializer
	 */
	constructor(initializer: TemplateInfoInitializer)
	{
		this.head = initializer.head;
		this.templateSpans = initializer.templateSpans;
	}
}

export interface TemplateInfoInitializer
{
	head: string;
	templateSpans: Array<{ expression: string, literal: string }>;
}