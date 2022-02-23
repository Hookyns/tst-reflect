import { getMetadataStore as get } from "tst-reflect";

function _tst_reflect_wrap(description?: any)
{
	return get().wrap(description);
}

function _tst_reflect_lazy(typeId: number)
{
	return get().getLazy(typeId);
}

function _tst_reflect_set(typeId: number, data: any): void
{
	get().set(typeId, data);
}

function _tst_reflect_get(typeId: number)
{
	return get().get(typeId);
}

export {
	_tst_reflect_get,
	_tst_reflect_wrap,
};

