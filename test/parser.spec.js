import { should } from 'chai';
import { MetaDataParser } from '@ryunoki/metadataparser';

import { addToParser } from '../index.js';

should();

describe('MetaDataParserMf2', function () {
  let parser, sourceUrl;

  // Taken from the h-entry Microformats wiki page
  const exampleHtml = '<article class="h-entry">' +
    '  <h1 class="p-name"><a class="u-url" href="/abc">Microformats are amazing</a></h1>' +
    '  <p>Published by <a class="p-author h-card" href="http://example.com">W. Developer</a>' +
    '     on <time class="dt-published" datetime="2013-06-13 12:00:00">13<sup>th</sup> June 2013</time>' +
    '  <p class="p-summary">In which I extoll the virtues of using microformats.</p>' +
    '  <div class="e-content">' +
    '    <p><a href="#bar">Yet</a> another <a>wow</a></p>' +
    '    <p><a href="http://example.org/bar">Blah</a> blah blah</p>' +
    '  </div>' +
    '</article>';

  beforeEach(function () {
    sourceUrl = 'http://example.com/foo';
    parser = addToParser(new MetaDataParser());
  });

  describe('extract', function () {
    it('should parse the microformats data', async function () {
      const props = await parser.extract(sourceUrl, exampleHtml);

      props.should.be.an('object')
        .that.has.property('microformats')
        .that.contain.keys('items', 'rels')
        .and.has.nested.property('items[0].properties')
        .that.is.an('object')
        .that.contain.keys('author', 'name', 'published', 'summary', 'url')

      props.microformats.items[0].properties.should.have.property('url');
      props.microformats.items[0].properties.url.should.deep.equal(['http://example.com/abc']);
      props.microformats.items[0].properties.should.have.property('published');
      props.microformats.items[0].properties.published.should.deep.equal(['2013-06-13 12:00:00']);
      props.microformats.items[0].properties.should.have.nested.property('author[0].properties.name[0]', 'W. Developer');
      props.microformats.items[0].properties.should.have.property('content');
      props.microformats.items[0].properties.content.should.deep.equal([
        {
          html: '<p><a href="#bar">Yet</a> another <a>wow</a></p>    <p><a href="http://example.org/bar">Blah</a> blah blah</p>',
          value: 'Yet another wow    Blah blah blah'
        }
      ]);
    });
  });
});
