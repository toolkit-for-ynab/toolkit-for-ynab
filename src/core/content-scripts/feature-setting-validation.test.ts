import { createFeatureSettingValidator } from './feature-setting-validation';

const mockSettings = [
  {
    name: 'CheckboxFeature' as FeatureName,
    type: 'checkbox' as const,
    default: false,
    section: 'general' as const,
    title: 'checkbox',
    description: 'checkbox',
  },
  {
    name: 'SelectFeature' as FeatureName,
    type: 'select' as const,
    default: false,
    section: 'general' as const,
    title: 'select',
    description: 'select',
    options: [
      { name: 'one', value: '1' },
      { name: 'two', value: '2' },
    ],
  },
  {
    name: 'ColorFeature' as FeatureName,
    type: 'color' as const,
    default: '#ffffff',
    section: 'general' as const,
    title: 'color',
    description: 'color',
  },
];

describe('feature-setting-validation', () => {
  const validate = createFeatureSettingValidator(mockSettings);

  it('returns normalized boolean for checkbox values', () => {
    expect(validate('CheckboxFeature' as FeatureName, 'true')).toBe(true);
    expect(validate('CheckboxFeature' as FeatureName, false)).toBe(false);
  });

  it('rejects checkbox values with unexpected types', () => {
    expect(validate('CheckboxFeature' as FeatureName, 'invalid')).toBeNull();
  });

  it('allows select option values and disabled state', () => {
    expect(validate('SelectFeature' as FeatureName, '2')).toBe('2');
    expect(validate('SelectFeature' as FeatureName, false)).toBe(false);
  });

  it('rejects select values not defined in options', () => {
    expect(validate('SelectFeature' as FeatureName, '5')).toBeNull();
  });

  it('validates color values using hex format', () => {
    expect(validate('ColorFeature' as FeatureName, '#abc')).toBe('#abc');
    expect(validate('ColorFeature' as FeatureName, 'rgb(0,0,0)')).toBeNull();
  });

  it('returns null for unknown feature names', () => {
    expect(validate('UnknownFeature' as FeatureName, true)).toBeNull();
  });
});
