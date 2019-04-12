import { always, assoc, compose, has, ifElse, isEmpty, o, prop } from 'ramda';
import * as getSlug from 'speakingurl';
import { webpadPost } from '../webpadPost';

/**
 * Creates a permlink based on a provided title.
 * @param title A title to convert into permlink.
 */
export const createPermlink: (title: string) => string = ifElse(
  isEmpty,
  always(`${Date.now()}`),
  o(
    slug => `${slug}-${Date.now()}`,
    title => getSlug(title, { custom: { _: '-' } })
  )
);

/**
 * Adds a `permlink` property to provided `target` object, based on provided `webpadPost` object.
 */
export const withPermlink = (webpadPost: webpadPost) => (target: {
  [key: string]: any;
}): { permlink: string; [K: string]: any } =>
  assoc(
    'permlink',
    ifElse(
      has('permlink'),
      prop('permlink'),
      compose(
        createPermlink,
        prop('title')
      )
    )(webpadPost),
    target
  );
