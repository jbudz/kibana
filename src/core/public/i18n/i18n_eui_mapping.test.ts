/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

jest.mock('@kbn/i18n');

import { i18n } from '@kbn/i18n';

import i18ntokens from '@elastic/eui/i18ntokens.json';
import { getEuiContextMapping } from './i18n_eui_mapping';

/** Regexp to find {values} usage */
const VALUES_REGEXP = /\{\w+\}/;

describe('@elastic/eui i18n tokens', () => {
  const i18nTranslateActual = jest.requireActual('@kbn/i18n').i18n.translate;
  const i18nTranslateMock = jest
    .fn()
    .mockImplementation((id, { defaultMessage }) => defaultMessage);
  i18n.translate = i18nTranslateMock;

  const euiContextMapping = getEuiContextMapping();

  test('all tokens are mapped', () => {
    // Extract the tokens from the EUI library: We need to uniq them because they might be duplicated
    const euiTokensFromLib = [...new Set(i18ntokens.map(({ token }) => token))];
    const euiTokensFromMapping = Object.keys(euiContextMapping);

    expect(euiTokensFromMapping.sort()).toStrictEqual(euiTokensFromLib.sort());
  });

  test('tokens that include {word} should be mapped to functions', () => {
    const euiTokensFromLibWithValues = i18ntokens.filter(({ defString }) =>
      VALUES_REGEXP.test(defString)
    );
    const euiTokensFromLib = [...new Set(euiTokensFromLibWithValues.map(({ token }) => token))];
    const euiTokensFromMapping = Object.entries(euiContextMapping)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key);

    expect(euiTokensFromMapping.sort()).toStrictEqual(euiTokensFromLib.sort());
  });

  i18ntokens.forEach(({ token, defString }) => {
    describe(`Token "${token}"`, () => {
      let i18nTranslateCall: [
        string,
        { defaultMessage: string; values?: object; description?: string }
      ];

      beforeAll(() => {
        // If it's a function, call it, so we have the mock to register the call.
        const entry = euiContextMapping[token as keyof typeof euiContextMapping];
        const translationOutput = typeof entry === 'function' ? entry({}) : entry;

        // If it's a string, it comes from i18n.translate call
        if (typeof translationOutput === 'string') {
          // find the call in the mocks
          i18nTranslateCall = i18nTranslateMock.mock.calls.find(
            ([kbnToken]) => kbnToken === `core.${token}`
          );
        } else {
          // Otherwise, it's a fn returning `FormattedMessage` component => read the props
          const { id, defaultMessage, values } = translationOutput.props;
          i18nTranslateCall = [id, { defaultMessage, values }];
        }
      });

      test('a translation should be registered as `core.{TOKEN}`', () => {
        expect(i18nTranslateCall).not.toBeUndefined();
      });

      test('defaultMessage is in sync with defString', () => {
        const isDefFunction = defString.includes('}) =>');
        const isPluralizationDefFunction =
          defString.includes(' === 1 ?') || defString.includes(' > 1 ?');

        // Clean up typical errors from the `@elastic/eui` extraction token tool
        const normalizedDefString = defString
          // Quoted words should use double-quotes
          .replace(/\s'/g, ' "')
          .replace(/'\s/g, '" ')
          // Should not include break-lines
          .replace(/\n/g, '')
          // Should trim extra spaces
          .replace(/\s{2,}/g, ' ')
          .trim();

        if (!isDefFunction) {
          expect(i18nTranslateCall[1].defaultMessage).toBe(normalizedDefString);
        } else {
          // Certain EUI defStrings are actually functions (that currently primarily handle
          // pluralization). To check EUI's pluralization against Kibana's pluralization, we
          // need to eval the defString and then actually i18n.translate & compare the 2 outputs
          const defFunction = eval(defString); // eslint-disable-line no-eval
          const defFunctionArg = normalizedDefString.split('({ ')[1].split('})')[0]; // TODO: All EUI pluralization fns currently only pass 1 arg. If this changes in the future and 2 args are passed, we'll need to do some extra splitting by ','

          if (isPluralizationDefFunction) {
            const singularValue = { [defFunctionArg]: 1 };
            expect(
              i18nTranslateActual(token, {
                defaultMessage: i18nTranslateCall[1].defaultMessage,
                values: singularValue,
              })
            ).toEqual(defFunction(singularValue));

            const pluralValue = { [defFunctionArg]: 2 };
            expect(
              i18nTranslateActual(token, {
                defaultMessage: i18nTranslateCall[1].defaultMessage,
                values: pluralValue,
              })
            ).toEqual(defFunction(pluralValue));
          } else {
            throw new Error(
              `We currently only have logic written for EUI pluralization def functions.
              This is a new type of def function that will need custom logic written for it.`
            );
          }
        }
      });

      test('values should match', () => {
        const valuesFromEuiLib = defString.match(new RegExp(VALUES_REGEXP, 'g')) || [];
        const receivedValuesInMock = Object.keys(i18nTranslateCall[1].values ?? {}).map(
          (key) => `{${key}}`
        );
        expect(receivedValuesInMock.sort()).toStrictEqual(valuesFromEuiLib.sort());
      });
    });
  });
});
