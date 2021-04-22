function inferType<TType>() {
	return getType<TType>().name;
}

const variable = 5;
inferType<typeof variable>(); // "number"