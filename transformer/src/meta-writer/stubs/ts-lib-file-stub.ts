import { NodeProcessMetaStore } from "tst-reflect";

function _tst_reflect_wrap(description?: any)
{
	return NodeProcessMetaStore.get().wrap(description);
}

function _tst_reflect_lazy(typeId: number)
{
	return NodeProcessMetaStore.get().getLazy(typeId);
}

function _tst_reflect_set(typeId: number, data: any): void
{
	NodeProcessMetaStore.get().set(typeId, data);
}

function _tst_reflect_get(typeId: number)
{
	return NodeProcessMetaStore.get().get(typeId);
}

export {
	_tst_reflect_get,
	_tst_reflect_wrap,
};

