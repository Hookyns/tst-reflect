import { Type } from "tst-reflect";

function _tst_reflect_wrap(description?: any)
{
	return Type.store.wrap(description);
}

function _tst_reflect_lazy(typeId: number)
{
	return Type.store.getLazy(typeId);
}

function _tst_reflect_set(typeId: number, data: any): void
{
	Type.store.set(typeId, data);
}

function _tst_reflect_get(typeId: number)
{
	return Type.store.get(typeId);
}

export {
	_tst_reflect_get,
	_tst_reflect_wrap,
};

