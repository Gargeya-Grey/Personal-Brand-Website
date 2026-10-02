/** Closed-schema building blocks for the reviewed public export contract.
 * No contract is registered or imported until its version and fields are approved.
 * Validation errors intentionally exclude input values, keys, and private paths.
 */
export type ExportValidator<T> = (value: unknown) => T;

export class InvalidEvalExport extends Error {
  constructor() {
    super('The public evaluation export does not match an approved contract.');
    this.name = 'InvalidEvalExport';
  }
}

function reject(): never {
  throw new InvalidEvalExport();
}

function plainRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) reject();
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) reject();
  // JSON has data properties only. Do not execute accessors supplied by another caller.
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(value).some((key) => typeof key !== 'string')) reject();
  if (Object.values(descriptors).some((descriptor) => !('value' in descriptor))) reject();
  return value as Record<string, unknown>;
}

export function exactExportObject<S extends Record<string, ExportValidator<unknown>>>(
  fields: S,
): ExportValidator<{ [K in keyof S]: ReturnType<S[K]> }> {
  const approvedKeys = Object.keys(fields);
  return (value) => {
    const record = plainRecord(value);
    const keys = Object.getOwnPropertyNames(record);
    if (
      keys.length !== approvedKeys.length ||
      keys.some((key) => !Object.hasOwn(fields, key)) ||
      approvedKeys.some((key) => !Object.hasOwn(record, key))
    )
      reject();
    // Construct a new projection. Never spread or serialize the supplied record.
    return Object.fromEntries(approvedKeys.map((key) => [key, fields[key](record[key])])) as {
      [K in keyof S]: ReturnType<S[K]>;
    };
  };
}

export function exportChoice<const T extends readonly (string | number)[]>(
  choices: T,
): ExportValidator<T[number]> {
  return (value) => {
    if (!choices.some((choice) => choice === value)) reject();
    return value as T[number];
  };
}

/** For identifiers only. Human-readable model/harness labels need an approved choice list. */
export function exportIdentifier(pattern: RegExp, maxLength: number): ExportValidator<string> {
  if (
    pattern.global ||
    pattern.sticky ||
    pattern.multiline ||
    !pattern.source.startsWith('^') ||
    !pattern.source.endsWith('$') ||
    !Number.isSafeInteger(maxLength) ||
    maxLength < 1
  ) {
    throw new Error('Export identifier validators need a stable pattern and a positive limit.');
  }
  return (value) => {
    if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) reject();
    const match = pattern.exec(value);
    if (!match || match.index !== 0 || match[0].length !== value.length) reject();
    return value;
  };
}

export function exportNumber({
  integer = false,
  max = Number.MAX_SAFE_INTEGER,
}: { integer?: boolean; max?: number } = {}): ExportValidator<number> {
  if (!Number.isFinite(max) || max < 0 || max > Number.MAX_SAFE_INTEGER) {
    throw new Error('Export numeric validators need a finite nonnegative safe limit.');
  }
  return (value) => {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > max ||
      (integer && !Number.isSafeInteger(value))
    )
      reject();
    return value;
  };
}

export function nullableExportValue<T>(validator: ExportValidator<T>): ExportValidator<T | null> {
  return (value) => (value === null ? null : validator(value));
}

export function exportArray<T>(
  validator: ExportValidator<T>,
  maxItems: number,
): ExportValidator<T[]> {
  if (!Number.isSafeInteger(maxItems) || maxItems < 0) {
    throw new Error('Export array validators need a finite nonnegative item limit.');
  }
  return (value) => {
    if (!Array.isArray(value) || value.length > maxItems) reject();
    if (Object.getPrototypeOf(value) !== Array.prototype) reject();
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (Reflect.ownKeys(value).length !== value.length + 1) reject();
    const output: T[] = [];
    for (let index = 0; index < value.length; index++) {
      const descriptor = descriptors[String(index)];
      // Reject holes, accessors, and extra properties rather than dropping them on serialization.
      if (!descriptor || !('value' in descriptor)) reject();
      output.push(validator(descriptor.value));
    }
    return output;
  };
}

/** Version parsers must validate the entire root and every nested record with exact schemas.
 * Register only reviewed versions; an unknown version is a publication failure, not an empty report.
 */
export function parseVersionedEvalExport<T>(
  value: unknown,
  approvedVersions: Readonly<Record<number, ExportValidator<T>>>,
): T {
  const record = plainRecord(value);
  const version = record.report_version;
  if (
    typeof version !== 'number' ||
    !Number.isSafeInteger(version) ||
    version < 1 ||
    !Object.hasOwn(approvedVersions, version)
  )
    reject();
  return approvedVersions[version](record);
}
