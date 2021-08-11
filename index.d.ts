import { ApiGenerationOptions, ApiConfiguration } from './types';

/**
 * @param init If string then this is a location of the file that holds processing configuration. Otherwise it is already prepared configuration.
 * @param opts Processing options.
 */
declare function mainFn(init: string|Map<string, ApiConfiguration|string|string[]>, opts?: ApiGenerationOptions): Promise<void>;

declare namespace mainFn {
  /**
   * Runs the default function and exists the process when failed.
   * @param {Map<string, ApiConfiguration>} init The list of files to parse with their configuration.
   * @param {ApiGenerationOptions=} opts Optional parsing options.
   */
  function generate(init: Map<string, ApiConfiguration>, opts?: ApiGenerationOptions): Promise<void>;
}

export = mainFn;
