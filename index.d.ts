import { ApiGenerationOptions, ApiConfiguration } from './types';

declare function process(init: string|Map<string, ApiConfiguration|string|string[]>, opts?: ApiGenerationOptions): Promise<void>;

export = process;
