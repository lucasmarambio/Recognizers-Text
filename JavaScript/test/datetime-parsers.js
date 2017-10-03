var _ = require('lodash');
var Constants = require('./constants');
var SupportedCultures = require('./cultures');
var Recognizers = require('recognizers-text-datetime');

// Configs
var EnglishCommonDateTimeParserConfiguration = Recognizers.EnglishCommonDateTimeParserConfiguration;

var LanguagesConfig = {
    'English': new EnglishCommonDateTimeParserConfiguration()
    // 'Spanish': new SpanishCommonDateTimeParserConfiguration()
};

var ParserTypes = [
    'Date',
    'Time',
    'DatePeriod',
    'TimePeriod',
    'DateTime',
    'DateTimePeriod',
    'Duration',
    'Holiday',
    'Set',
    'Merged'
];

var parserConfigs = _.keys(LanguagesConfig)
    .map(c => ParserTypes.map(p => ({ lang: c, parserType: p, config: LanguagesConfig[c] })))
    .reduce((a, b) => a.concat(b), []);                      // flatten

// [Eng-Date, Eng-Time, ... ]
var parserKeys = parserConfigs.map(cfg => _.findKey(SupportedCultures, (c) => c.cultureName === cfg.lang) + '-' + cfg.parserType)
var parserObjects = parserConfigs.map(cfg => createParser(cfg.lang, cfg.parserType, cfg.config));

// { 'Eng-Date': {parser}, 'Eng-Time': {parser}, ... }
module.exports =  _.zipObject(parserKeys, parserObjects);

function createParser(lang, parser, commonConfig) {
    var parserModuleName = '../compiled/dateTime/base' + parser;
    var parserTypeName = [Constants.Base, parser, Constants.Parser].join('');
    var ParserType = Recognizers[parserTypeName];
    if (!ParserType) {
        throw new Error(`Parser Type ${parserTypeName} was not found in module ${parserModuleName}`);
    }

    var configModuleName = '../compiled/dateTime/' + lang.toLowerCase() + '/' + toCamelCase(parser) + Constants.Configuration;
    var configTypeName = lang + parser + Constants.ParserConfiguration;
    var ConfigType = Recognizers[configTypeName];
    if (!ConfigType) {
        throw new Error(`Config Type ${configTypeName} was not found in module ${configModuleName}`);
    }

    var config = commonConfig
        ? new ConfigType(commonConfig)
        : new ConfigType();

    return new ParserType(config);
}

function toCamelCase(name) {
    return name.substring(0, 1).toLowerCase() + name.substring(1);
}
