import { URL } from 'node:url';

import { mf2 } from 'microformats-parser';

import pkg from './package.json' with { type: 'json' };

// TODO: Figure out what microformatsVersion and livingStandard mean
export const versions = {
  version: pkg.version,
  microformatsVersion: '2.0.4',
  livingStandard: '2016-05-25T09:22:18Z'
};

export function extractMicroformats ($, data) {
  const mfData = mf2($.html(), {
    baseUrl: data.baseUrl,
  });

  return Object.assign(data, {
    microformats: mfData,
    microformatsVersion: versions
  });
}

export function extractHrefs ($, data) {
  // TODO: Extract from mf2 data instead – first extract a feed than links for each feed item?
  data.hrefs = [];

  const links = $('a');
  const hrefs = {};

  for (let i = 0, length = links.length; i < length; i += 1) {
    const href = links.eq(i).attr('href');
    try {
      if (href) {
        const resolvedUrl = (new URL(href, data.baseUrl)).toString();
        hrefs[resolvedUrl] = true;
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      /* snip */
    }
  }

  for (let i in hrefs) {
    data.hrefs.push(i);
  }

  return data;
}

export function addToParser (parserInstance) {
  parserInstance.removeExtractor('headers');
  parserInstance.addExtractor('microformats', extractMicroformats);
  parserInstance.addExtractor('hrefs', extractHrefs);

  return parserInstance;
}
