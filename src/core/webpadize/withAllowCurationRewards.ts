import { assoc } from 'ramda';
import { SteemPost } from '../SteemPost';

/**
 * Adds a `allowCurationRewards` property to provided `target` object, based on provided `steemPost` object.
 */
export const withAllowCurationRewards = (steemPost: SteemPost) => (target: {
  [key: string]: any;
}): { allowCurationRewards: boolean; [K: string]: any } =>
  // hardcoded true cause of a problem with api.steemit.com node (Hivemind)
  assoc('allowCurationRewards', true, target);
