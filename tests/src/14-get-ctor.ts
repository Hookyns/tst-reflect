import { getType } from "tst-reflect";

class NotExportedClass
{
}

export class ExportedClass
{
}

test("getCtor() of not exported class", async () => {
	const type = getType<NotExportedClass>();
	const Ctor = await type.getCtor();

	expect(Ctor).toBeDefined();

	const instance = Reflect.construct(Ctor!, []);
	expect(instance).toBeDefined();
	expect(instance instanceof NotExportedClass).toBe(true);
});

test("getCtor() of exported class", async () => {
	const type = getType<ExportedClass>();
	const Ctor = await type.getCtor();

	expect(Ctor).toBeDefined();

	const instance = Reflect.construct(Ctor!, []);
	expect(instance).toBeDefined();
	expect(instance instanceof ExportedClass).toBe(true);
});