import * as ColorQuery from './color';
import * as InternalScale from './scale';

export * from './query';
export * from './scale';
export * from './theme';
export * from './types';
export * from './variant';

export const Color = { ...ColorQuery };
export const Scale = { ...InternalScale };
