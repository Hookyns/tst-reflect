export type AsyncCtorReference = () => Promise<{ new(...args: any[]): any }>;
export type SyncCtorReference = () => { new(...args: any[]): any };
export type ModuleReference = number | symbol;
export type TypeReference = number | symbol;