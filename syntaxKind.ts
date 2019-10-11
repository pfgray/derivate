import { SyntaxKind, TypeFlags, SymbolFlags } from "typescript";

export function toName(s: SyntaxKind): string {
  switch (s) {
    case SyntaxKind.Unknown:
      return "Unknown";
    case SyntaxKind.EndOfFileToken:
      return "EndOfFileToken";
    case SyntaxKind.SingleLineCommentTrivia:
      return "SingleLineCommentTrivia";
    case SyntaxKind.MultiLineCommentTrivia:
      return "MultiLineCommentTrivia";
    case SyntaxKind.NewLineTrivia:
      return "NewLineTrivia";
    case SyntaxKind.WhitespaceTrivia:
      return "WhitespaceTrivia";
    case SyntaxKind.ShebangTrivia:
      return "ShebangTrivia";
    case SyntaxKind.ConflictMarkerTrivia:
      return "ConflictMarkerTrivia";
    case SyntaxKind.NumericLiteral:
      return "NumericLiteral";
    case SyntaxKind.BigIntLiteral:
      return "BigIntLiteral";
    case SyntaxKind.StringLiteral:
      return "StringLiteral";
    case SyntaxKind.JsxText:
      return "JsxText";
    case SyntaxKind.JsxTextAllWhiteSpaces:
      return "JsxTextAllWhiteSpaces";
    case SyntaxKind.RegularExpressionLiteral:
      return "RegularExpressionLiteral";
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return "NoSubstitutionTemplateLiteral";
    case SyntaxKind.TemplateHead:
      return "TemplateHead";
    case SyntaxKind.TemplateMiddle:
      return "TemplateMiddle";
    case SyntaxKind.TemplateTail:
      return "TemplateTail";
    case SyntaxKind.OpenBraceToken:
      return "OpenBraceToken";
    case SyntaxKind.CloseBraceToken:
      return "CloseBraceToken";
    case SyntaxKind.OpenParenToken:
      return "OpenParenToken";
    case SyntaxKind.CloseParenToken:
      return "CloseParenToken";
    case SyntaxKind.OpenBracketToken:
      return "OpenBracketToken";
    case SyntaxKind.CloseBracketToken:
      return "CloseBracketToken";
    case SyntaxKind.DotToken:
      return "DotToken";
    case SyntaxKind.DotDotDotToken:
      return "DotDotDotToken";
    case SyntaxKind.SemicolonToken:
      return "SemicolonToken";
    case SyntaxKind.CommaToken:
      return "CommaToken";
    case SyntaxKind.LessThanToken:
      return "LessThanToken";
    case SyntaxKind.LessThanSlashToken:
      return "LessThanSlashToken";
    case SyntaxKind.GreaterThanToken:
      return "GreaterThanToken";
    case SyntaxKind.LessThanEqualsToken:
      return "LessThanEqualsToken";
    case SyntaxKind.GreaterThanEqualsToken:
      return "GreaterThanEqualsToken";
    case SyntaxKind.EqualsEqualsToken:
      return "EqualsEqualsToken";
    case SyntaxKind.ExclamationEqualsToken:
      return "ExclamationEqualsToken";
    case SyntaxKind.EqualsEqualsEqualsToken:
      return "EqualsEqualsEqualsToken";
    case SyntaxKind.ExclamationEqualsEqualsToken:
      return "ExclamationEqualsEqualsToken";
    case SyntaxKind.EqualsGreaterThanToken:
      return "EqualsGreaterThanToken";
    case SyntaxKind.PlusToken:
      return "PlusToken";
    case SyntaxKind.MinusToken:
      return "MinusToken";
    case SyntaxKind.AsteriskToken:
      return "AsteriskToken";
    case SyntaxKind.AsteriskAsteriskToken:
      return "AsteriskAsteriskToken";
    case SyntaxKind.SlashToken:
      return "SlashToken";
    case SyntaxKind.PercentToken:
      return "PercentToken";
    case SyntaxKind.PlusPlusToken:
      return "PlusPlusToken";
    case SyntaxKind.MinusMinusToken:
      return "MinusMinusToken";
    case SyntaxKind.LessThanLessThanToken:
      return "LessThanLessThanToken";
    case SyntaxKind.GreaterThanGreaterThanToken:
      return "GreaterThanGreaterThanToken";
    case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
      return "GreaterThanGreaterThanGreaterThanToken";
    case SyntaxKind.AmpersandToken:
      return "AmpersandToken";
    case SyntaxKind.BarToken:
      return "BarToken";
    case SyntaxKind.CaretToken:
      return "CaretToken";
    case SyntaxKind.ExclamationToken:
      return "ExclamationToken";
    case SyntaxKind.TildeToken:
      return "TildeToken";
    case SyntaxKind.AmpersandAmpersandToken:
      return "AmpersandAmpersandToken";
    case SyntaxKind.BarBarToken:
      return "BarBarToken";
    case SyntaxKind.QuestionToken:
      return "QuestionToken";
    case SyntaxKind.ColonToken:
      return "ColonToken";
    case SyntaxKind.AtToken:
      return "AtToken";
    /** Only the JSDoc scanner produces BacktickToken. The normal scanner produces NoSubstitutionTemplateLiteral and related kinds. */
    case SyntaxKind.BacktickToken:
      return "BacktickToken";
    case SyntaxKind.EqualsToken:
      return "EqualsToken";
    case SyntaxKind.PlusEqualsToken:
      return "PlusEqualsToken";
    case SyntaxKind.MinusEqualsToken:
      return "MinusEqualsToken";
    case SyntaxKind.AsteriskEqualsToken:
      return "AsteriskEqualsToken";
    case SyntaxKind.AsteriskAsteriskEqualsToken:
      return "AsteriskAsteriskEqualsToken";
    case SyntaxKind.SlashEqualsToken:
      return "SlashEqualsToken";
    case SyntaxKind.PercentEqualsToken:
      return "PercentEqualsToken";
    case SyntaxKind.LessThanLessThanEqualsToken:
      return "LessThanLessThanEqualsToken";
    case SyntaxKind.GreaterThanGreaterThanEqualsToken:
      return "GreaterThanGreaterThanEqualsToken";
    case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
      return "GreaterThanGreaterThanGreaterThanEqualsToken";
    case SyntaxKind.AmpersandEqualsToken:
      return "AmpersandEqualsToken";
    case SyntaxKind.BarEqualsToken:
      return "BarEqualsToken";
    case SyntaxKind.CaretEqualsToken:
      return "CaretEqualsToken";
    case SyntaxKind.Identifier:
      return "Identifier";
    case SyntaxKind.BreakKeyword:
      return "BreakKeyword";
    case SyntaxKind.CaseKeyword:
      return "CaseKeyword";
    case SyntaxKind.CatchKeyword:
      return "CatchKeyword";
    case SyntaxKind.ClassKeyword:
      return "ClassKeyword";
    case SyntaxKind.ConstKeyword:
      return "ConstKeyword";
    case SyntaxKind.ContinueKeyword:
      return "ContinueKeyword";
    case SyntaxKind.DebuggerKeyword:
      return "DebuggerKeyword";
    case SyntaxKind.DefaultKeyword:
      return "DefaultKeyword";
    case SyntaxKind.DeleteKeyword:
      return "DeleteKeyword";
    case SyntaxKind.DoKeyword:
      return "DoKeyword";
    case SyntaxKind.ElseKeyword:
      return "ElseKeyword";
    case SyntaxKind.EnumKeyword:
      return "EnumKeyword";
    case SyntaxKind.ExportKeyword:
      return "ExportKeyword";
    case SyntaxKind.ExtendsKeyword:
      return "ExtendsKeyword";
    case SyntaxKind.FalseKeyword:
      return "FalseKeyword";
    case SyntaxKind.FinallyKeyword:
      return "FinallyKeyword";
    case SyntaxKind.ForKeyword:
      return "ForKeyword";
    case SyntaxKind.FunctionKeyword:
      return "FunctionKeyword";
    case SyntaxKind.IfKeyword:
      return "IfKeyword";
    case SyntaxKind.ImportKeyword:
      return "ImportKeyword";
    case SyntaxKind.InKeyword:
      return "InKeyword";
    case SyntaxKind.InstanceOfKeyword:
      return "InstanceOfKeyword";
    case SyntaxKind.NewKeyword:
      return "NewKeyword";
    case SyntaxKind.NullKeyword:
      return "NullKeyword";
    case SyntaxKind.ReturnKeyword:
      return "ReturnKeyword";
    case SyntaxKind.SuperKeyword:
      return "SuperKeyword";
    case SyntaxKind.SwitchKeyword:
      return "SwitchKeyword";
    case SyntaxKind.ThisKeyword:
      return "ThisKeyword";
    case SyntaxKind.ThrowKeyword:
      return "ThrowKeyword";
    case SyntaxKind.TrueKeyword:
      return "TrueKeyword";
    case SyntaxKind.TryKeyword:
      return "TryKeyword";
    case SyntaxKind.TypeOfKeyword:
      return "TypeOfKeyword";
    case SyntaxKind.VarKeyword:
      return "VarKeyword";
    case SyntaxKind.VoidKeyword:
      return "VoidKeyword";
    case SyntaxKind.WhileKeyword:
      return "WhileKeyword";
    case SyntaxKind.WithKeyword:
      return "WithKeyword";
    case SyntaxKind.ImplementsKeyword:
      return "ImplementsKeyword";
    case SyntaxKind.InterfaceKeyword:
      return "InterfaceKeyword";
    case SyntaxKind.LetKeyword:
      return "LetKeyword";
    case SyntaxKind.PackageKeyword:
      return "PackageKeyword";
    case SyntaxKind.PrivateKeyword:
      return "PrivateKeyword";
    case SyntaxKind.ProtectedKeyword:
      return "ProtectedKeyword";
    case SyntaxKind.PublicKeyword:
      return "PublicKeyword";
    case SyntaxKind.StaticKeyword:
      return "StaticKeyword";
    case SyntaxKind.YieldKeyword:
      return "YieldKeyword";
    case SyntaxKind.AbstractKeyword:
      return "AbstractKeyword";
    case SyntaxKind.AsKeyword:
      return "AsKeyword";
    case SyntaxKind.AnyKeyword:
      return "AnyKeyword";
    case SyntaxKind.AsyncKeyword:
      return "AsyncKeyword";
    case SyntaxKind.AwaitKeyword:
      return "AwaitKeyword";
    case SyntaxKind.BooleanKeyword:
      return "BooleanKeyword";
    case SyntaxKind.ConstructorKeyword:
      return "ConstructorKeyword";
    case SyntaxKind.DeclareKeyword:
      return "DeclareKeyword";
    case SyntaxKind.GetKeyword:
      return "GetKeyword";
    case SyntaxKind.InferKeyword:
      return "InferKeyword";
    case SyntaxKind.IsKeyword:
      return "IsKeyword";
    case SyntaxKind.KeyOfKeyword:
      return "KeyOfKeyword";
    case SyntaxKind.ModuleKeyword:
      return "ModuleKeyword";
    case SyntaxKind.NamespaceKeyword:
      return "NamespaceKeyword";
    case SyntaxKind.NeverKeyword:
      return "NeverKeyword";
    case SyntaxKind.ReadonlyKeyword:
      return "ReadonlyKeyword";
    case SyntaxKind.RequireKeyword:
      return "RequireKeyword";
    case SyntaxKind.NumberKeyword:
      return "NumberKeyword";
    case SyntaxKind.ObjectKeyword:
      return "ObjectKeyword";
    case SyntaxKind.SetKeyword:
      return "SetKeyword";
    case SyntaxKind.StringKeyword:
      return "StringKeyword";
    case SyntaxKind.SymbolKeyword:
      return "SymbolKeyword";
    case SyntaxKind.TypeKeyword:
      return "TypeKeyword";
    case SyntaxKind.UndefinedKeyword:
      return "UndefinedKeyword";
    case SyntaxKind.UniqueKeyword:
      return "UniqueKeyword";
    case SyntaxKind.UnknownKeyword:
      return "UnknownKeyword";
    case SyntaxKind.FromKeyword:
      return "FromKeyword";
    case SyntaxKind.GlobalKeyword:
      return "GlobalKeyword";
    case SyntaxKind.BigIntKeyword:
      return "BigIntKeyword";
    case SyntaxKind.OfKeyword:
      return "OfKeyword";
    case SyntaxKind.QualifiedName:
      return "QualifiedName";
    case SyntaxKind.ComputedPropertyName:
      return "ComputedPropertyName";
    case SyntaxKind.TypeParameter:
      return "TypeParameter";
    case SyntaxKind.Parameter:
      return "Parameter";
    case SyntaxKind.Decorator:
      return "Decorator";
    case SyntaxKind.PropertySignature:
      return "PropertySignature";
    case SyntaxKind.PropertyDeclaration:
      return "PropertyDeclaration";
    case SyntaxKind.MethodSignature:
      return "MethodSignature";
    case SyntaxKind.MethodDeclaration:
      return "MethodDeclaration";
    case SyntaxKind.Constructor:
      return "Constructor";
    case SyntaxKind.GetAccessor:
      return "GetAccessor";
    case SyntaxKind.SetAccessor:
      return "SetAccessor";
    case SyntaxKind.CallSignature:
      return "CallSignature";
    case SyntaxKind.ConstructSignature:
      return "ConstructSignature";
    case SyntaxKind.IndexSignature:
      return "IndexSignature";
    case SyntaxKind.TypePredicate:
      return "TypePredicate";
    case SyntaxKind.TypeReference:
      return "TypeReference";
    case SyntaxKind.FunctionType:
      return "FunctionType";
    case SyntaxKind.ConstructorType:
      return "ConstructorType";
    case SyntaxKind.TypeQuery:
      return "TypeQuery";
    case SyntaxKind.TypeLiteral:
      return "TypeLiteral";
    case SyntaxKind.ArrayType:
      return "ArrayType";
    case SyntaxKind.TupleType:
      return "TupleType";
    case SyntaxKind.OptionalType:
      return "OptionalType";
    case SyntaxKind.RestType:
      return "RestType";
    case SyntaxKind.UnionType:
      return "UnionType";
    case SyntaxKind.IntersectionType:
      return "IntersectionType";
    case SyntaxKind.ConditionalType:
      return "ConditionalType";
    case SyntaxKind.InferType:
      return "InferType";
    case SyntaxKind.ParenthesizedType:
      return "ParenthesizedType";
    case SyntaxKind.ThisType:
      return "ThisType";
    case SyntaxKind.TypeOperator:
      return "TypeOperator";
    case SyntaxKind.IndexedAccessType:
      return "IndexedAccessType";
    case SyntaxKind.MappedType:
      return "MappedType";
    case SyntaxKind.LiteralType:
      return "LiteralType";
    case SyntaxKind.ImportType:
      return "ImportType";
    case SyntaxKind.ObjectBindingPattern:
      return "ObjectBindingPattern";
    case SyntaxKind.ArrayBindingPattern:
      return "ArrayBindingPattern";
    case SyntaxKind.BindingElement:
      return "BindingElement";
    case SyntaxKind.ArrayLiteralExpression:
      return "ArrayLiteralExpression";
    case SyntaxKind.ObjectLiteralExpression:
      return "ObjectLiteralExpression";
    case SyntaxKind.PropertyAccessExpression:
      return "PropertyAccessExpression";
    case SyntaxKind.ElementAccessExpression:
      return "ElementAccessExpression";
    case SyntaxKind.CallExpression:
      return "CallExpression";
    case SyntaxKind.NewExpression:
      return "NewExpression";
    case SyntaxKind.TaggedTemplateExpression:
      return "TaggedTemplateExpression";
    case SyntaxKind.TypeAssertionExpression:
      return "TypeAssertionExpression";
    case SyntaxKind.ParenthesizedExpression:
      return "ParenthesizedExpression";
    case SyntaxKind.FunctionExpression:
      return "FunctionExpression";
    case SyntaxKind.ArrowFunction:
      return "ArrowFunction";
    case SyntaxKind.DeleteExpression:
      return "DeleteExpression";
    case SyntaxKind.TypeOfExpression:
      return "TypeOfExpression";
    case SyntaxKind.VoidExpression:
      return "VoidExpression";
    case SyntaxKind.AwaitExpression:
      return "AwaitExpression";
    case SyntaxKind.PrefixUnaryExpression:
      return "PrefixUnaryExpression";
    case SyntaxKind.PostfixUnaryExpression:
      return "PostfixUnaryExpression";
    case SyntaxKind.BinaryExpression:
      return "BinaryExpression";
    case SyntaxKind.ConditionalExpression:
      return "ConditionalExpression";
    case SyntaxKind.TemplateExpression:
      return "TemplateExpression";
    case SyntaxKind.YieldExpression:
      return "YieldExpression";
    case SyntaxKind.SpreadElement:
      return "SpreadElement";
    case SyntaxKind.ClassExpression:
      return "ClassExpression";
    case SyntaxKind.OmittedExpression:
      return "OmittedExpression";
    case SyntaxKind.ExpressionWithTypeArguments:
      return "ExpressionWithTypeArguments";
    case SyntaxKind.AsExpression:
      return "AsExpression";
    case SyntaxKind.NonNullExpression:
      return "NonNullExpression";
    case SyntaxKind.MetaProperty:
      return "MetaProperty";
    case SyntaxKind.SyntheticExpression:
      return "SyntheticExpression";
    case SyntaxKind.TemplateSpan:
      return "TemplateSpan";
    case SyntaxKind.SemicolonClassElement:
      return "SemicolonClassElement";
    case SyntaxKind.Block:
      return "Block";
    case SyntaxKind.VariableStatement:
      return "VariableStatement";
    case SyntaxKind.EmptyStatement:
      return "EmptyStatement";
    case SyntaxKind.ExpressionStatement:
      return "ExpressionStatement";
    case SyntaxKind.IfStatement:
      return "IfStatement";
    case SyntaxKind.DoStatement:
      return "DoStatement";
    case SyntaxKind.WhileStatement:
      return "WhileStatement";
    case SyntaxKind.ForStatement:
      return "ForStatement";
    case SyntaxKind.ForInStatement:
      return "ForInStatement";
    case SyntaxKind.ForOfStatement:
      return "ForOfStatement";
    case SyntaxKind.ContinueStatement:
      return "ContinueStatement";
    case SyntaxKind.BreakStatement:
      return "BreakStatement";
    case SyntaxKind.ReturnStatement:
      return "ReturnStatement";
    case SyntaxKind.WithStatement:
      return "WithStatement";
    case SyntaxKind.SwitchStatement:
      return "SwitchStatement";
    case SyntaxKind.LabeledStatement:
      return "LabeledStatement";
    case SyntaxKind.ThrowStatement:
      return "ThrowStatement";
    case SyntaxKind.TryStatement:
      return "TryStatement";
    case SyntaxKind.DebuggerStatement:
      return "DebuggerStatement";
    case SyntaxKind.VariableDeclaration:
      return "VariableDeclaration";
    case SyntaxKind.VariableDeclarationList:
      return "VariableDeclarationList";
    case SyntaxKind.FunctionDeclaration:
      return "FunctionDeclaration";
    case SyntaxKind.ClassDeclaration:
      return "ClassDeclaration";
    case SyntaxKind.InterfaceDeclaration:
      return "InterfaceDeclaration";
    case SyntaxKind.TypeAliasDeclaration:
      return "TypeAliasDeclaration";
    case SyntaxKind.EnumDeclaration:
      return "EnumDeclaration";
    case SyntaxKind.ModuleDeclaration:
      return "ModuleDeclaration";
    case SyntaxKind.ModuleBlock:
      return "ModuleBlock";
    case SyntaxKind.CaseBlock:
      return "CaseBlock";
    case SyntaxKind.NamespaceExportDeclaration:
      return "NamespaceExportDeclaration";
    case SyntaxKind.ImportEqualsDeclaration:
      return "ImportEqualsDeclaration";
    case SyntaxKind.ImportDeclaration:
      return "ImportDeclaration";
    case SyntaxKind.ImportClause:
      return "ImportClause";
    case SyntaxKind.NamespaceImport:
      return "NamespaceImport";
    case SyntaxKind.NamedImports:
      return "NamedImports";
    case SyntaxKind.ImportSpecifier:
      return "ImportSpecifier";
    case SyntaxKind.ExportAssignment:
      return "ExportAssignment";
    case SyntaxKind.ExportDeclaration:
      return "ExportDeclaration";
    case SyntaxKind.NamedExports:
      return "NamedExports";
    case SyntaxKind.ExportSpecifier:
      return "ExportSpecifier";
    case SyntaxKind.MissingDeclaration:
      return "MissingDeclaration";
    case SyntaxKind.ExternalModuleReference:
      return "ExternalModuleReference";
    case SyntaxKind.JsxElement:
      return "JsxElement";
    case SyntaxKind.JsxSelfClosingElement:
      return "JsxSelfClosingElement";
    case SyntaxKind.JsxOpeningElement:
      return "JsxOpeningElement";
    case SyntaxKind.JsxClosingElement:
      return "JsxClosingElement";
    case SyntaxKind.JsxFragment:
      return "JsxFragment";
    case SyntaxKind.JsxOpeningFragment:
      return "JsxOpeningFragment";
    case SyntaxKind.JsxClosingFragment:
      return "JsxClosingFragment";
    case SyntaxKind.JsxAttribute:
      return "JsxAttribute";
    case SyntaxKind.JsxAttributes:
      return "JsxAttributes";
    case SyntaxKind.JsxSpreadAttribute:
      return "JsxSpreadAttribute";
    case SyntaxKind.JsxExpression:
      return "JsxExpression";
    case SyntaxKind.CaseClause:
      return "CaseClause";
    case SyntaxKind.DefaultClause:
      return "DefaultClause";
    case SyntaxKind.HeritageClause:
      return "HeritageClause";
    case SyntaxKind.CatchClause:
      return "CatchClause";
    case SyntaxKind.PropertyAssignment:
      return "PropertyAssignment";
    case SyntaxKind.ShorthandPropertyAssignment:
      return "ShorthandPropertyAssignment";
    case SyntaxKind.SpreadAssignment:
      return "SpreadAssignment";
    case SyntaxKind.EnumMember:
      return "EnumMember";
    case SyntaxKind.UnparsedPrologue:
      return "UnparsedPrologue";
    case SyntaxKind.UnparsedPrepend:
      return "UnparsedPrepend";
    case SyntaxKind.UnparsedText:
      return "UnparsedText";
    case SyntaxKind.UnparsedInternalText:
      return "UnparsedInternalText";
    case SyntaxKind.UnparsedSyntheticReference:
      return "UnparsedSyntheticReference";
    case SyntaxKind.SourceFile:
      return "SourceFile";
    case SyntaxKind.Bundle:
      return "Bundle";
    case SyntaxKind.UnparsedSource:
      return "UnparsedSource";
    case SyntaxKind.InputFiles:
      return "InputFiles";
    case SyntaxKind.JSDocTypeExpression:
      return "JSDocTypeExpression";
    case SyntaxKind.JSDocAllType:
      return "JSDocAllType";
    case SyntaxKind.JSDocUnknownType:
      return "JSDocUnknownType";
    case SyntaxKind.JSDocNullableType:
      return "JSDocNullableType";
    case SyntaxKind.JSDocNonNullableType:
      return "JSDocNonNullableType";
    case SyntaxKind.JSDocOptionalType:
      return "JSDocOptionalType";
    case SyntaxKind.JSDocFunctionType:
      return "JSDocFunctionType";
    case SyntaxKind.JSDocVariadicType:
      return "JSDocVariadicType";
    case SyntaxKind.JSDocNamepathType:
      return "JSDocNamepathType";
    case SyntaxKind.JSDocComment:
      return "JSDocComment";
    case SyntaxKind.JSDocTypeLiteral:
      return "JSDocTypeLiteral";
    case SyntaxKind.JSDocSignature:
      return "JSDocSignature";
    case SyntaxKind.JSDocTag:
      return "JSDocTag";
    case SyntaxKind.JSDocAugmentsTag:
      return "JSDocAugmentsTag";
    case SyntaxKind.JSDocAuthorTag:
      return "JSDocAuthorTag";
    case SyntaxKind.JSDocClassTag:
      return "JSDocClassTag";
    case SyntaxKind.JSDocCallbackTag:
      return "JSDocCallbackTag";
    case SyntaxKind.JSDocEnumTag:
      return "JSDocEnumTag";
    case SyntaxKind.JSDocParameterTag:
      return "JSDocParameterTag";
    case SyntaxKind.JSDocReturnTag:
      return "JSDocReturnTag";
    case SyntaxKind.JSDocThisTag:
      return "JSDocThisTag";
    case SyntaxKind.JSDocTypeTag:
      return "JSDocTypeTag";
    case SyntaxKind.JSDocTemplateTag:
      return "JSDocTemplateTag";
    case SyntaxKind.JSDocTypedefTag:
      return "JSDocTypedefTag";
    case SyntaxKind.JSDocPropertyTag:
      return "JSDocPropertyTag";
    case SyntaxKind.SyntaxList:
      return "SyntaxList";
    case SyntaxKind.NotEmittedStatement:
      return "NotEmittedStatement";
    case SyntaxKind.PartiallyEmittedExpression:
      return "PartiallyEmittedExpression";
    case SyntaxKind.CommaListExpression:
      return "CommaListExpression";
    case SyntaxKind.MergeDeclarationMarker:
      return "MergeDeclarationMarker";
    case SyntaxKind.EndOfDeclarationMarker:
      return "EndOfDeclarationMarker";
    case SyntaxKind.Count:
      return "Count";
    case SyntaxKind.FirstAssignment:
      return "FirstAssignment";
    case SyntaxKind.LastAssignment:
      return "LastAssignment";
    case SyntaxKind.FirstCompoundAssignment:
      return "FirstCompoundAssignment";
    case SyntaxKind.LastCompoundAssignment:
      return "LastCompoundAssignment";
    case SyntaxKind.FirstReservedWord:
      return "FirstReservedWord";
    case SyntaxKind.LastReservedWord:
      return "LastReservedWord";
    case SyntaxKind.FirstKeyword:
      return "FirstKeyword";
    case SyntaxKind.LastKeyword:
      return "LastKeyword";
    case SyntaxKind.FirstFutureReservedWord:
      return "FirstFutureReservedWord";
    case SyntaxKind.LastFutureReservedWord:
      return "LastFutureReservedWord";
    case SyntaxKind.FirstTypeNode:
      return "FirstTypeNode";
    case SyntaxKind.LastTypeNode:
      return "LastTypeNode";
    case SyntaxKind.FirstPunctuation:
      return "FirstPunctuation";
    case SyntaxKind.LastPunctuation:
      return "LastPunctuation";
    case SyntaxKind.FirstToken:
      return "FirstToken";
    case SyntaxKind.LastToken:
      return "LastToken";
    case SyntaxKind.FirstTriviaToken:
      return "FirstTriviaToken";
    case SyntaxKind.LastTriviaToken:
      return "LastTriviaToken";
    case SyntaxKind.FirstLiteralToken:
      return "FirstLiteralToken";
    case SyntaxKind.LastLiteralToken:
      return "LastLiteralToken";
    case SyntaxKind.FirstTemplateToken:
      return "FirstTemplateToken";
    case SyntaxKind.LastTemplateToken:
      return "LastTemplateToken";
    case SyntaxKind.FirstBinaryOperator:
      return "FirstBinaryOperator";
    case SyntaxKind.LastBinaryOperator:
      return "LastBinaryOperator";
    case SyntaxKind.FirstNode:
      return "FirstNode";
    case SyntaxKind.FirstJSDocNode:
      return "FirstJSDocNode";
    case SyntaxKind.LastJSDocNode:
      return "LastJSDocNode";
    case SyntaxKind.FirstJSDocTagNode:
      return "FirstJSDocTagNode";
    case SyntaxKind.LastJSDocTagNode:
      return "LastJSDocTagNode";
    default:
      return "LOL";
  }
}



export function flagToName(flag: TypeFlags): string {
switch(flag){
case TypeFlags.Any: return "Any";
case TypeFlags.Unknown: return "Unknown";
case TypeFlags.String: return "String";
case TypeFlags.Number: return "Number";
case TypeFlags.Boolean: return "Boolean";
case TypeFlags.Enum: return "Enum";
case TypeFlags.BigInt: return "BigInt";
case TypeFlags.StringLiteral: return "StringLiteral";
case TypeFlags.NumberLiteral: return "NumberLiteral";
case TypeFlags.BooleanLiteral: return "BooleanLiteral";
case TypeFlags.EnumLiteral: return "EnumLiteral";
case TypeFlags.BigIntLiteral: return "BigIntLiteral";
case TypeFlags.ESSymbol: return "ESSymbol";
case TypeFlags.UniqueESSymbol: return "UniqueESSymbol";
case TypeFlags.Void: return "Void";
case TypeFlags.Undefined: return "Undefined";
case TypeFlags.Null: return "Null";
case TypeFlags.Never: return "Never";
case TypeFlags.TypeParameter: return "TypeParameter";
case TypeFlags.Object: return "Object";
case TypeFlags.Union: return "Union";
case TypeFlags.Intersection: return "Intersection";
case TypeFlags.Index: return "Index";
case TypeFlags.IndexedAccess: return "IndexedAccess";
case TypeFlags.Conditional: return "Conditional";
case TypeFlags.Substitution: return "Substitution";
case TypeFlags.NonPrimitive: return "NonPrimitive";
case TypeFlags.Literal: return "Literal";
case TypeFlags.Unit: return "Unit";
case TypeFlags.StringOrNumberLiteral: return "StringOrNumberLiteral";
case TypeFlags.PossiblyFalsy: return "PossiblyFalsy";
case TypeFlags.StringLike: return "StringLike";
case TypeFlags.NumberLike: return "NumberLike";
case TypeFlags.BigIntLike: return "BigIntLike";
case TypeFlags.BooleanLike: return "BooleanLike";
case TypeFlags.EnumLike: return "EnumLike";
case TypeFlags.ESSymbolLike: return "ESSymbolLike";
case TypeFlags.VoidLike: return "VoidLike";
case TypeFlags.UnionOrIntersection: return "UnionOrIntersection";
case TypeFlags.StructuredType: return "StructuredType";
case TypeFlags.TypeVariable: return "TypeVariable";
case TypeFlags.InstantiableNonPrimitive: return "InstantiableNonPrimitive";
case TypeFlags.InstantiablePrimitive: return "InstantiablePrimitive";
case TypeFlags.Instantiable: return "Instantiable";
case TypeFlags.StructuredOrInstantiable: return "StructuredOrInstantiable";
case TypeFlags.Narrowable: return "Narrowable";
case TypeFlags.NotUnionOrUnit: return "NotUnionOrUnit";
}}

export function symbolFlagToName(s: SymbolFlags): string {
  switch(s) {
case SymbolFlags.None: return "None";
case SymbolFlags.FunctionScopedVariable: return "FunctionScopedVariable";
case SymbolFlags.BlockScopedVariable: return "BlockScopedVariable";
case SymbolFlags.Property: return "Property";
case SymbolFlags.EnumMember: return "EnumMember";
case SymbolFlags.Function: return "Function";
case SymbolFlags.Class: return "Class";
case SymbolFlags.Interface: return "Interface";
case SymbolFlags.ConstEnum: return "ConstEnum";
case SymbolFlags.RegularEnum: return "RegularEnum";
case SymbolFlags.ValueModule: return "ValueModule";
case SymbolFlags.NamespaceModule: return "NamespaceModule";
case SymbolFlags.TypeLiteral: return "TypeLiteral";
case SymbolFlags.ObjectLiteral: return "ObjectLiteral";
case SymbolFlags.Method: return "Method";
case SymbolFlags.Constructor: return "Constructor";
case SymbolFlags.GetAccessor: return "GetAccessor";
case SymbolFlags.SetAccessor: return "SetAccessor";
case SymbolFlags.Signature: return "Signature";
case SymbolFlags.TypeParameter: return "TypeParameter";
case SymbolFlags.TypeAlias: return "TypeAlias";
case SymbolFlags.ExportValue: return "ExportValue";
case SymbolFlags.Alias: return "Alias";
case SymbolFlags.Prototype: return "Prototype";
case SymbolFlags.ExportStar: return "ExportStar";
case SymbolFlags.Optional: return "Optional";
case SymbolFlags.Transient: return "Transient";
case SymbolFlags.Assignment: return "Assignment";
case SymbolFlags.ModuleExports: return "ModuleExports";
case SymbolFlags.Enum: return "Enum";
case SymbolFlags.Variable: return "Variable";
case SymbolFlags.Value: return "Value";
case SymbolFlags.Type: return "Type";
case SymbolFlags.Namespace: return "Namespace";
case SymbolFlags.Module: return "Module";
case SymbolFlags.Accessor: return "Accessor";
case SymbolFlags.FunctionScopedVariableExcludes: return "FunctionScopedVariableExcludes";
case SymbolFlags.BlockScopedVariableExcludes: return "BlockScopedVariableExcludes";
case SymbolFlags.ParameterExcludes: return "ParameterExcludes";
case SymbolFlags.PropertyExcludes: return "PropertyExcludes";
case SymbolFlags.EnumMemberExcludes: return "EnumMemberExcludes";
case SymbolFlags.FunctionExcludes: return "FunctionExcludes";
case SymbolFlags.ClassExcludes: return "ClassExcludes";
case SymbolFlags.InterfaceExcludes: return "InterfaceExcludes";
case SymbolFlags.RegularEnumExcludes: return "RegularEnumExcludes";
case SymbolFlags.ConstEnumExcludes: return "ConstEnumExcludes";
case SymbolFlags.ValueModuleExcludes: return "ValueModuleExcludes";
case SymbolFlags.NamespaceModuleExcludes: return "NamespaceModuleExcludes";
case SymbolFlags.MethodExcludes: return "MethodExcludes";
case SymbolFlags.GetAccessorExcludes: return "GetAccessorExcludes";
case SymbolFlags.SetAccessorExcludes: return "SetAccessorExcludes";
case SymbolFlags.TypeParameterExcludes: return "TypeParameterExcludes";
case SymbolFlags.TypeAliasExcludes: return "TypeAliasExcludes";
case SymbolFlags.AliasExcludes: return "AliasExcludes";
case SymbolFlags.ModuleMember: return "ModuleMember";
case SymbolFlags.ExportHasLocal: return "ExportHasLocal";
case SymbolFlags.BlockScoped: return "BlockScoped";
case SymbolFlags.PropertyOrAccessor: return "PropertyOrAccessor";
case SymbolFlags.ClassMember: return "ClassMember";
  }}