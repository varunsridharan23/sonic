import { body, group1, group2, group3, element1 } from '../setup';
import { matches, find, query, pseudos } from '../../src/sonic';

describe('sonic', () => {

    describe('matches', () => {
        it('should return true for an element with a matching selector string', () => {
            const selectors = [
                'div',
                '#element-1',
                '.class1',
                '.class2',
                '.class1.class2.class3',
                '[attr]',
                '[attr=value]',
                '[attr="value"]',
                '[attr][attr2][lang]',
                '[attr2~="random"]',
                '[attr2*="rand"]',
                '[attr2^="some"]',
                '[attr2$="text"]',
                '[lang|="en"]',
                ':first-child',
                'div#element-1.class1.class2.class3[attr=value][attr2="some random text"][lang="en-us"]'
            ];
            selectors.forEach((selector) => expect(matches(element1, selector)).to.equal(true));
        });

        it('should return false for an element with a non-matching selector string', () => {
            const selectors = [
                'span',
                '#element',
                '.class12',
                ':last-child',
                '[foo]',
                ':last-child'
            ];
            selectors.forEach((selector) => expect(matches(element1, selector)).to.equal(false));
        });
    });

    describe('find/query', () => {
        function checkSelectors(items) {
            items.forEach((item) => {
                const context = item.context || document;
                let expected = item.expected;
                if (!expected) {
                    expected = context.querySelectorAll(item.selector);
                }
                const element = find(item.selector, context);
                const elements = query(item.selector, context);
                checkElements(expected, element, elements, item.length);
            });
        }

        function checkElements(expected, element, elements, expectedLength) {
            expect(elements).to.have.lengthOf(expectedLength);
            expect(element).to.equal(expected[0] || null);
            elements.forEach((el, i) => {
                expect(el).to.equal(expected[i]);
            });
        }

        it('query should return an array', () => {
            expect(query('div')).to.be.an('array');
        });

        it('find should return null if no element is found', () => {
            expect(find('#foobar')).to.be.a('null');
        });

        it('should be context-aware', () => {
            const expected = document.querySelector('#group-2 section h1');
            const element = find('section h1', group2);
            expect(element).to.not.be.a('null');
            expect(element).to.equal(expected);
        });

        it('should support a contextual element as an optional second argument', () => {
            const expected = group1.querySelectorAll('div');
            const elements = query('div', group1);
            elements.forEach((el, i) => {
                expect(group1.contains(el)).to.equal(true);
                expect(el).to.equal(expected[i]);
            });
        });

        it('should support a selector string for a contextual element as an optional second argument', () => {
            const expected = group1.querySelectorAll('div');
            const elements = query('div', '#group-1');
            elements.forEach((el, i) => {
                expect(group1.contains(el)).to.equal(true);
                expect(el).to.equal(expected[i]);
            });
        });

        it('should not return duplicate elements', () => {
            const cache = [];
            const elements = query('div, div');
            elements.forEach((el) => {
                expect(cache).to.not.include(el);
                cache.push(el);
            });
        });

        it('should return elements in the order they appear in the document', () => {
            const elements = query('div');
            const expected = elements.slice().sort((a, b) => 3 - (a.compareDocumentPosition(b) & 6));
            elements.forEach((el, i) => {
                expect(el).to.equal(expected[i]);
            });
        });

        it('should accept selector strings with leading/trailing spaces', () => {
            checkSelectors([
                {selector: ' div', length: 9},
                {selector: 'div ', length: 9},
                {selector: ' div ', length: 9},
                {selector: '  div   ', length: 9}
            ]);
        });

        it('should support the universal selector (*)', () => {
            checkSelectors([
                {selector: '*', context: body, length: 35},
                {selector: '*', context: group1, length: 14}
            ]);
        });

        it('should support tag selectors', () => {
            checkSelectors([
                {selector: 'section', length: 4},
                {selector: 'div', context: group1, length: 6}
            ]);
        });

        it('should support id selectors', () => {
            checkSelectors([
                {selector: '#group-1', length: 1},
                {selector: '#element-1', length: 1},
                {selector: '#group-1', context: group1, length: 0}
            ]);
        });

        it('should support class selectors', () => {
            checkSelectors([
                {selector: '.class1', length: 3},
                {selector: '.class1.class2', length: 3},
                {selector: '.class1.class2.class3', length: 1},
                {selector: '.class1.class2', context: group1, length: 2}
            ]);
        });

        it('should support multiple selectors', () => {
            checkSelectors([
                {selector: 'div, span', length: 16},
                {selector: 'span, em, i', context: group1, length: 8}
            ]);
        });

        describe('attribute selectors', () => {
            it('should support [attr]', () => {
                checkSelectors([
                    {selector: '[foo]', length: 9},
                    {selector: '[attr][attr2]', length: 2},
                    {selector: '[attr][attr2][lang]', length: 1},
                    {selector: '[attr2]', context: group2, length: 2}
                ]);
            });

            it('should support [attr=value]', () => {
                checkSelectors([
                    {selector: '[attr=value]', length: 2},
                    {selector: '[attr="value"]', length: 2},
                    {selector: "[attr='value']", length: 2},
                    {selector: '[attr=\'value\']', length: 2},
                    {selector: '[attr=value]', context: group2, length: 1}
                ]);
            });

            it('should support [attr~=value]', () => {
                checkSelectors([
                    {selector: '[attr2~="random"]', length: 3},
                    {selector: '[attr2~="random"]', context: group2, length: 2}
                ]);
            });

            it('should support [attr|=value]', () => {
                checkSelectors([
                    {selector: '[lang|="en"]', length: 2},
                    {selector: '[lang|="en"]', context: group2, length: 0}
                ]);
            });

            it('should support [attr^=value]', () => {
                checkSelectors([
                    {selector: '[attr2^="some"]', length: 3},
                    {selector: '[attr2^="some"]', context: group2, length: 2}
                ]);
            });

            it('should support [attr$=value]', () => {
                checkSelectors([
                    {selector: '[attr2$="text"]', length: 3},
                    {selector: '[attr2$="text"]', context: group2, length: 2}
                ]);
            });

            it('should support [attr*=value]', () => {
                checkSelectors([
                    {selector: '[attr2*="rand"]', length: 3},
                    {selector: '[attr2*="rand"]', context: group2, length: 2}
                ]);
            });
        });

        describe('pseudo-class selectors', () => {
            it('should support :first-child', () => {
                checkSelectors([
                    {selector: ':first-child', context: body, length: 9},
                    {selector: ':first-child', context: group1, length: 3}
                ]);
            });

            it('should support :last-child', () => {
                checkSelectors([
                    {selector: ':last-child', context: body, length: 9},
                    {selector: ':last-child', context: group1, length: 3}
                ]);
            });

            it('should support :only-child', () => {
                checkSelectors([
                    {selector: ':only-child', context: body, length: 2},
                    {selector: ':only-child', context: group2, length: 1}
                ]);
            });

            it('should support :first-of-type', () => {
                checkSelectors([
                    {selector: ':first-of-type', context: body, length: 16},
                    {selector: ':first-of-type', context: group3, length: 2}
                ]);
            });

            it('should support :last-of-type', () => {
                checkSelectors([
                    {selector: ':last-of-type', context: body, length: 16},
                    {selector: ':last-of-type', context: group1, length: 6}
                ]);
            });

            it('should support :only-of-type', () => {
                checkSelectors([
                    {selector: ':only-of-type', context: body, length: 8},
                    {selector: ':only-of-type', context: group2, length: 5}
                ]);
            });

            it('should support :checked', () => {
                checkSelectors([
                    {selector: ':checked', length: 2},
                    {selector: ':checked', context: group2, length: 0}
                ]);
            });

            it('should support :disabled', () => {
                checkSelectors([
                    {selector: ':disabled', length: 1},
                    {selector: ':disabled', context: group1, length: 0}
                ]);
            });

            it('should support :enabled', () => {
                checkSelectors([
                    {selector: ':enabled', length: 3},
                    {selector: ':enabled', context: group2, length: 0}
                ]);
            });

            it('should support :not()', () => {
                checkSelectors([
                    {selector: ':not([foo])', context: body, length: 26},
                    {selector: ':not([foo])', context: group2, length: 12},
                    {selector: ':not(span):not(div)', context: body, length: 19},
                    {selector: ':not(span):not(div)', context: group1, length: 2}
                ]);
            });

            it('should support :nth-child()', () => {
                checkSelectors([
                    {selector: ':nth-child(4n+1)', context: group1, length: 4},
                    {selector: ':nth-child(-n+6)', context: group1, length: 14},
                    {selector: ':nth-child(odd)', context: group1, length: 7},
                    {selector: ':nth-child(even)', context: group1, length: 7},
                    {selector: ':nth-child(3n)', context: group1, length: 4},
                    {selector: ':nth-child(0n+1)', context: group1, length: 3},
                    {selector: ':nth-child(4)', context: group1, length: 3},
                    {selector: ':nth-child(-n+3)', context: group1, length: 9},
                    {selector: ':nth-child(3n-2)', context: group1, length: 6}
                ]);
            });

            it('should support :nth-last-child()', () => {
                checkSelectors([
                    {selector: ':nth-last-child(4n+1)', context: group2, length: 5},
                    {selector: ':nth-last-child(-n+6)', context: group2, length: 12},
                    {selector: ':nth-last-child(odd)', context: group2, length: 8},
                    {selector: ':nth-last-child(even)', context: group2, length: 5},
                    {selector: ':nth-last-child(3n)', context: group2, length: 3},
                    {selector: ':nth-last-child(0n+1)', context: group2, length: 3},
                    {selector: ':nth-last-child(4)', context: group2, length: 2},
                    {selector: ':nth-last-child(-n+3)', context: group2, length: 7},
                    {selector: ':nth-last-child(3n-2)', context: group2, length: 6}
                ]);
            });

            it('should support :nth-last-of-type()', () => {
                checkSelectors([
                    {selector: ':nth-last-of-type(4n+1)', context: group1, length: 6},
                    {selector: ':nth-last-of-type(-n+6)', context: group1, length: 14},
                    {selector: ':nth-last-of-type(odd)', context: group1, length: 8},
                    {selector: ':nth-last-of-type(even)', context: group1, length: 6},
                    {selector: ':nth-last-of-type(3n)', context: group1, length: 2},
                    {selector: ':nth-last-of-type(0n+1)', context: group1, length: 6},
                    {selector: ':nth-last-of-type(2)', context: group1, length: 4},
                    {selector: ':nth-last-of-type(-n+3)', context: group1, length: 12},
                    {selector: ':nth-last-of-type(3n-2)', context: group1, length: 8}
                ]);
            });

            it('should support :nth-of-type()', () => {
                checkSelectors([
                    {selector: ':nth-of-type(4n+1)', context: group2, length: 8},
                    {selector: ':nth-of-type(-n+6)', context: group2, length: 13},
                    {selector: ':nth-of-type(odd)', context: group2, length: 10},
                    {selector: ':nth-of-type(even)', context: group2, length: 3},
                    {selector: ':nth-of-type(3n)', context: group2, length: 2},
                    {selector: ':nth-of-type(0n+1)', context: group2, length: 7},
                    {selector: ':nth-of-type(4)', context: group2, length: 1},
                    {selector: ':nth-of-type(-n+3)', context: group2, length: 11},
                    {selector: ':nth-of-type(3n-2)', context: group2, length: 8}
                ]);
            });

            it('should support custom pseudo-class selectors', () => {
                pseudos.foo = (el) => el.hasAttribute('foo');
                pseudos.bar = (el, name) => el.hasAttribute(name);
                checkSelectors([
                    {selector: ':foo', expected: body.querySelectorAll('[foo]'), length: 9},
                    {selector: ':bar(lang)', expected: body.querySelectorAll('[lang]'), length: 2}
                ]);
            });
        });

        describe('combinator selectors', () => {
            it('should support decendant combinator (+)', () => {
                checkSelectors([
                    {selector: 'section div', length: 9},
                    {selector: 'section div span', length: 6},
                    {selector: 'div div', context: group1, length: 2}
                ]);
            });

            it('should support child combinator (>)', () => {
                checkSelectors([
                    {selector: 'section > div', length: 7},
                    {selector: 'section > div > span[foo]', length: 4},
                    {selector: 'section>ul>li', length: 5},
                    {selector: 'ul > .list-item', context: group2, length: 5}
                ]);
            });

            it('should support leading child combinator (>)', () => {
                checkSelectors([
                    {selector: '> div', context: group1, expected: body.querySelectorAll('#group-1 > div'), length: 4},
                    {selector: '>div', context: group2, expected: body.querySelectorAll('#group-2 > div'), length: 3},
                    {selector: '> div > i', context: group1, expected: body.querySelectorAll('#group-1 > div > i'), length: 1}
                ]);
            });

            it('should support adjacent sibling combinator (+)', () => {
                checkSelectors([
                    {selector: 'div[foo] + div', length: 1},
                    {selector: 'div + i + em + span', length: 1},
                    {selector: 'div+span', length: 1},
                    {selector: '.list-item + .list-item', context: group2, length: 4}
                ]);
            });

            it('should support leading adjacent sibling combinator (+)', () => {
                checkSelectors([
                    {selector: '+ section', context: group1, expected: body.querySelectorAll('#group-1 + section'), length: 1},
                    {selector: '+ div', context: element1, expected: body.querySelectorAll('#group-1 > :first-child + div'), length: 1},
                    {selector: '+div', context: element1, expected: body.querySelectorAll('#group-1 > :first-child + div'), length: 1}
                ]);
            });

            it('should support general sibling combinator (~)', () => {
                checkSelectors([
                    {selector: 'div[foo] ~ div', context: body, length: 4},
                    {selector: 'div ~ em ~ span', context: body, length: 2},
                    {selector: 'em~span', context: body, length: 2},
                    {selector: 'h1 ~ [attr2]', context: group2, length: 2}
                ]);
            });

            it('should support leading general sibling combinator (~)', () => {
                checkSelectors([
                    {selector: '~ section', context: group1, expected: body.querySelectorAll('#group-1 ~ section'), length: 2},
                    {selector: '~ div', context: element1, expected: body.querySelectorAll('#group-1 > :first-child ~ div'), length: 3},
                    {selector: '~div', context: element1, expected: body.querySelectorAll('#group-1 > :first-child ~ div'), length: 3}
                ]);
            });
        });
    });
});
