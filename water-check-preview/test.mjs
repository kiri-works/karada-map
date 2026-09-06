import assert from 'node:assert/strict';
import { VOID, COLOR, RESULT, resolveVoidState, resolveColorState, classifyResult } from './logic.mjs';

function classify({ rawVoid, confirm, invalidated=false, recall='yes', color }) {
  return classifyResult({
    voidState: resolveVoidState({ raw: rawVoid, confirm, invalidated }),
    colorState: resolveColorState({ recall, selected: color })
  });
}

// MVP v0.1 20ケース破綻テストの実装対応。
assert.equal(classify({rawVoid:'7plus', color:'very-pale'}), RESULT.NOT_PROMINENT, '1');
assert.equal(classify({rawVoid:'2-4', color:'dark'}), RESULT.MULTIPLE, '2');
assert.equal(classify({rawVoid:'5-6', color:'dark'}), RESULT.MULTIPLE, '3');
assert.equal(classify({rawVoid:'2-4', color:'yellow'}), RESULT.PARTIAL, '4');
assert.equal(classify({rawVoid:'7plus', color:'dark'}), RESULT.PARTIAL, '5');
assert.equal(classify({rawVoid:'7plus', color:'yellow'}), RESULT.NOT_PROMINENT, '6');
assert.equal(classify({rawVoid:'7plus', color:'yellow'}), RESULT.NOT_PROMINENT, '7');
assert.equal(classify({rawVoid:'unknown', color:'dark'}), RESULT.UNCLEAR, '8');
assert.equal(classify({rawVoid:'2-4', recall:'not-seen'}), RESULT.UNCLEAR, '9');
assert.equal(classify({rawVoid:'unknown', recall:'not-seen'}), RESULT.UNCLEAR, '10');
assert.equal(classify({rawVoid:'7plus', invalidated:true, color:'dark'}), RESULT.UNCLEAR, '11');
assert.equal(classify({rawVoid:'2-4', invalidated:true, color:'yellow'}), RESULT.UNCLEAR, '12');
assert.equal(classify({rawVoid:'2-4', color:'confounded'}), RESULT.UNCLEAR, '13');
assert.equal(classify({rawVoid:'7plus', color:'atypical'}), RESULT.COLOR_ATYPICAL, '14');
// 15-19 are STOP routes handled by UI state machine; they never call normal classifier.
assert.equal(resolveVoidState({raw:'0-1', confirm:'yes'}), VOID.SPECIAL, '20-void-state');
assert.equal(classify({rawVoid:'0-1', confirm:'yes', color:'yellow'}), RESULT.VOID_SPECIAL, '20-result');

// Additional boundaries
assert.equal(resolveVoidState({raw:'0-1', confirm:'forgot'}), VOID.UNKNOWN);
assert.equal(resolveVoidState({raw:'5-6', invalidated:true}), VOID.INVALID);
assert.equal(resolveColorState({recall:'hard-to-see'}), COLOR.UNKNOWN);
assert.equal(resolveColorState({recall:'yes', selected:'confounded'}), COLOR.CONFOUNDED);
assert.equal(classify({rawVoid:'7plus', color:'confounded'}), RESULT.UNCLEAR);
assert.equal(classify({rawVoid:'unknown', color:'yellow'}), RESULT.UNCLEAR);

console.log('PASS: MVP v0.1 classifier cases + boundary cases');
