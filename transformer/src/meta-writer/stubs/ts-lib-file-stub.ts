import { getMetaFileStore } from "tst-reflect";

function _tst_reflect_wrap(description?: any)
{
	return getMetaFileStore().wrap(description);
}

function _tst_reflect_lazy(typeId: number)
{
	return getMetaFileStore().getLazy(typeId);
}

function _tst_reflect_set(typeId: number, data: any): void
{
	getMetaFileStore().set(typeId, data);
}

function _tst_reflect_get(typeId: number)
{
	return getMetaFileStore().get(typeId);
}

export {
	_tst_reflect_get,
	_tst_reflect_wrap,
};

