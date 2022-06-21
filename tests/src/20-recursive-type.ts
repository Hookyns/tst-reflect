import { getType } from "tst-reflect";

test("getType<T>() of recursive type", () => {
	type Node = {
		left: Node;
		right: Node;
	};

	const nodeType = getType<Node>();
	const properties = nodeType.getProperties();
	expect(properties).toHaveLength(2);

	const leftProp = properties.find(prop => prop.name == "left")!;
	expect(leftProp).toBeTruthy();

	const leftPropNodeType = leftProp.type.getProperties().find(prop => prop.name == "left")?.type;
	expect(typeof leftPropNodeType).not.toBe("function");
	expect(leftPropNodeType).toBe(nodeType);

	const rightPropNodeType = leftProp.type.getProperties().find(prop => prop.name == "right")?.type;
	expect(typeof rightPropNodeType).not.toBe("function");
	expect(rightPropNodeType).toBe(nodeType);
});
