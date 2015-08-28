define(function (require) {
  var {has} = require('lodash');
  var {FieldNotFoundInCache} = require('ui/errors');

  return function mapRangeProvider(Promise, courier) {
    return function (filter) {
      if (!filter.range) return Promise.reject(filter);

      return courier
      .indexPatterns
      .get(filter.meta.index)
      .then(function (indexPattern) {
        var key = Object.keys(filter.range)[0];
        var field = indexPattern.fields.byName[key];
        if (!field) return Promise.reject(new FieldNotFoundInCache(key));

        var convert = field.format.getConverterFor('text');
        var range = filter.range[key];

        var left = has(range, 'gte') ? range.gte : range.gt;
        if (left == null) left = -Infinity;

        var right = has(range, 'lte') ? range.lte : range.lt;
        if (right == null) right = Infinity;

        return {
          key: key,
          value: `${convert(left)} to ${convert(right)}`
        };
      });

    };
  };
});
