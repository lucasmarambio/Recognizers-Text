// ------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
// ------------------------------------------------------------------------------

export namespace BaseNumbers {
	export const NumberReplaceToken = '@builtin.num';
	export const IntegerRegexDefinition = (placeholder: string, thousandsmark: string) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!(\\d+\\.|\\d+,))))\\d{1,3}(${thousandsmark}\\d{3})+(?=${placeholder})`; }
	export const DoubleRegexDefinition = (placeholder: string, thousandsmark: string, decimalmark: string) => { return `(((?<!\\d+\\s*)-\\s*)|((?<=\\b)(?<!\\d+\\.|\\d+,)))\\d{1,3}(${thousandsmark}\\d{3})+${decimalmark}\\d+(?=${placeholder})`; }
	export const PlaceHolderDefault = '\\\\D|\\\\b';
}
