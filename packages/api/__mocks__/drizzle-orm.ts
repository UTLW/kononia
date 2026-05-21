function noop(..._args: any[]): any {
  return { __mock: true };
}

export const eq = noop;
export const and = noop;
export const or = noop;
export const like = noop;
export const gte = noop;
export const lte = noop;
export const asc = noop;
export const desc = noop;
export const inArray = noop;
export const not = noop;
export const isNull = noop;
export const isNotNull = noop;
export const ne = noop;
export const exists = noop;
export const notExists = noop;
export const between = noop;
export const notBetween = noop;
export const lt = noop;
export const gt = noop;
export const count = noop;
export const sum = noop;
export const avg = noop;
export const min = noop;
export const max = noop;

export function aliasedTable(a: any) {
  return a;
}
export function getTableName(a: any) {
  return a?.name ?? "table";
}
export function getTableColumns() {
  return {};
}

export function sql(strings: TemplateStringsArray, ..._args: any[]) {
  return { __mock: true, getSQL: () => "" };
}

export function relations(schema: any, _relations: any) {
  return schema;
}

export const createTableRelationsHelpers = {
  many: (a: any) => a,
  one: (a: any) => a,
};
