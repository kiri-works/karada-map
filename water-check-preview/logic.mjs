export const VOID = Object.freeze({
  LOW_STRONG: 'VOID_LOW_STRONG',
  LOW: 'VOID_LOW',
  NOT_LOW: 'VOID_NOT_LOW',
  UNKNOWN: 'VOID_UNKNOWN',
  INVALID: 'VOID_INVALID',
  SPECIAL: 'VOID_SPECIAL'
});

export const COLOR = Object.freeze({
  LOW: 'COLOR_LOW',
  NOT_LOW: 'COLOR_NOT_LOW',
  UNKNOWN: 'COLOR_UNKNOWN',
  CONFOUNDED: 'COLOR_CONFOUNDED',
  ATYPICAL: 'COLOR_ATYPICAL'
});

export const RESULT = Object.freeze({
  MULTIPLE: 'RESULT_MULTIPLE',
  PARTIAL: 'RESULT_PARTIAL',
  NOT_PROMINENT: 'RESULT_NOT_PROMINENT',
  UNCLEAR: 'RESULT_UNCLEAR',
  VOID_SPECIAL: 'RESULT_VOID_SPECIAL',
  COLOR_ATYPICAL: 'RESULT_COLOR_ATYPICAL'
});

export function resolveVoidState({ raw, confirm = null, invalidated = false }) {
  let state;
  switch (raw) {
    case '0-1':
      state = confirm === 'yes' ? VOID.SPECIAL : VOID.UNKNOWN;
      break;
    case '2-4':
      state = VOID.LOW_STRONG;
      break;
    case '5-6':
      state = VOID.LOW;
      break;
    case '7plus':
      state = VOID.NOT_LOW;
      break;
    default:
      state = VOID.UNKNOWN;
  }
  return invalidated ? VOID.INVALID : state;
}

export function resolveColorState({ recall, selected = null }) {
  if (recall !== 'yes') return COLOR.UNKNOWN;
  switch (selected) {
    case 'very-pale':
    case 'yellow':
      return COLOR.NOT_LOW;
    case 'dark':
      return COLOR.LOW;
    case 'atypical':
      return COLOR.ATYPICAL;
    case 'confounded':
      return COLOR.CONFOUNDED;
    default:
      return COLOR.UNKNOWN;
  }
}

export function classifyResult({ voidState, colorState }) {
  if (colorState === COLOR.ATYPICAL) return RESULT.COLOR_ATYPICAL;
  if (voidState === VOID.SPECIAL) return RESULT.VOID_SPECIAL;

  const voidLow = voidState === VOID.LOW || voidState === VOID.LOW_STRONG;
  const voidNotLow = voidState === VOID.NOT_LOW;
  const colorLow = colorState === COLOR.LOW;
  const colorNotLow = colorState === COLOR.NOT_LOW;

  if (voidLow && colorLow) return RESULT.MULTIPLE;
  if ((voidLow && colorNotLow) || (voidNotLow && colorLow)) return RESULT.PARTIAL;
  if (voidNotLow && colorNotLow) return RESULT.NOT_PROMINENT;
  return RESULT.UNCLEAR;
}

export function buildReasonSummary({ voidState, colorState }) {
  const parts = [];

  if (voidState === VOID.LOW_STRONG) {
    parts.push({ key: 'void', status: 'low', text: '24時間の排尿回数が2〜4回でした。水分不足側でみられやすいサインのひとつとして扱います。' });
  } else if (voidState === VOID.LOW) {
    parts.push({ key: 'void', status: 'low', text: '24時間の排尿回数が5〜6回でした。水分不足側でみられやすいサインのひとつとして扱います。' });
  } else if (voidState === VOID.NOT_LOW) {
    parts.push({ key: 'void', status: 'not-low', text: '24時間の排尿回数は7回以上でした。今回の主判定では、不足側サインとしては扱いません。' });
  } else if (voidState === VOID.INVALID) {
    parts.push({ key: 'void', status: 'unknown', text: '排尿回数は、水分以外の影響を受けている可能性があるため、今回は主判定に使いません。' });
  } else if (voidState === VOID.UNKNOWN) {
    parts.push({ key: 'void', status: 'unknown', text: '24時間の排尿回数をはっきり思い出せなかったため、今回は主判定に使いません。' });
  }

  if (colorState === COLOR.LOW) {
    parts.push({ key: 'color', status: 'low', text: '日中に見た尿は「濃い黄色〜琥珀色」に近い回答でした。水分不足側でみられやすいサインのひとつとして扱います。' });
  } else if (colorState === COLOR.NOT_LOW) {
    parts.push({ key: 'color', status: 'not-low', text: '日中に見た尿は「ほぼ無色〜黄色」側の回答でした。今回の主判定では、不足側サインとしては扱いません。' });
  } else if (colorState === COLOR.CONFOUNDED) {
    parts.push({ key: 'color', status: 'unknown', text: 'ビタミン剤などの影響で普段と違う色だったため、今回は尿色を主判定に使いません。' });
  } else if (colorState === COLOR.UNKNOWN) {
    parts.push({ key: 'color', status: 'unknown', text: '尿の色を確認できなかった／決めにくかったため、今回は尿色を主判定に使いません。' });
  }

  return parts;
}

export function shouldAskPersistentThirst({ thirst, voidFactors = [] }) {
  if (thirst !== 'constant') return false;
  return voidFactors.includes('frequent-small') || voidFactors.includes('urinary-symptoms');
}
