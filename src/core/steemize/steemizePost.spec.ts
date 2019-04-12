import { SteemPostOperation } from './../SteemPostOperation';
import { steemizePost } from './steemizePost';
import { webpadPost } from '../webpadPost';

fdescribe('#core #steemize steemizePost', () => {
  let webpadPost: webpadPost;

  let author: string;

  beforeEach(() => {
    webpadPost = {
      title: '',
      body: '',
      thumbnailUrl: '',
      tags: [],
      community: '',
      jsonMetadata: '',
      beneficiaries: [],
      allowVotes: true,
      allowCurationRewards: true,
      percentSteemDollars: 50,
      maxAcceptedPayout: 1000
    };

    author = '';
  });

  it('should create Steem operations (`comment` and `comment_options`) in a correct order', () => {
    const operations: SteemPostOperation = steemizePost(webpadPost, author);

    expect(operations[0][0]).toBe('comment');
    expect(operations[1][0]).toBe('comment_options');
  });

  it('should create Steem operations (`comment` and `comment_options`) with a correct properties', () => {
    const operations: SteemPostOperation = steemizePost(webpadPost, author);

    expect(operations[0][1].author).toBeDefined();
    expect(operations[0][1].permlink).toBeDefined();
    expect(operations[0][1].body).toBeDefined();
    expect(operations[0][1].json_metadata).toBeDefined();
    expect(operations[0][1].parent_author).toBeDefined();
    expect(operations[0][1].parent_permlink).toBeDefined();
    expect(operations[0][1].title).toBeDefined();

    expect(operations[1][1].author).toBeDefined();
    expect(operations[1][1].permlink).toBeDefined();
    expect(operations[1][1].allow_curation_rewards).toBeDefined();
    expect(operations[1][1].allow_votes).toBeDefined();
    expect(operations[1][1].max_accepted_payout).toBeDefined();
    expect(operations[1][1].percent_steem_dollars).toBeDefined();
    expect(operations[1][1].extensions).toBeDefined();
  });

  it('should NOT mutate the `webpadPost` object', () => {
    steemizePost(webpadPost, author);

    expect(webpadPost).toEqual({
      title: '',
      body: '',
      thumbnailUrl: '',
      tags: [],
      community: '',
      jsonMetadata: '',
      beneficiaries: [],
      allowVotes: true,
      allowCurationRewards: true,
      percentSteemDollars: 50,
      maxAcceptedPayout: 1000
    });
  });
});
