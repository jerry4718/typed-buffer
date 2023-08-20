import { isExtendFrom } from '../src/utils/prototype-util.ts';
import * as t from '../mod.ts';
import { AdvancedParser, BaseParser } from '../src/context/base-parser.ts';
import { PrimitiveParser } from "../mod.ts";

console.log(isExtendFrom(t.Struct, Object));
console.log(isExtendFrom(t.Struct, Function));
console.log(isExtendFrom(t.Struct, BaseParser));
console.log(isExtendFrom(PrimitiveParser, PrimitiveParser));
console.log(isExtendFrom(PrimitiveParser, BaseParser));
console.log(isExtendFrom(AdvancedParser, BaseParser));
