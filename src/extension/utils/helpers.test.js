const { compareSemanticVersion } = require('./helpers');

describe('compareSemanticVersion', () => {
  it('true if the right version is greater than the left', () => {
    expect(compareSemanticVersion('1.0.0', '1.0.1')).toEqual(true);
    expect(compareSemanticVersion('1.0.0', '1.2.0')).toEqual(true);
    expect(compareSemanticVersion('1.0.0', '2.0.0')).toEqual(true);
    expect(compareSemanticVersion('1.0.0', '1.0.0.1001')).toEqual(true);
    expect(compareSemanticVersion('1.0.0', '10.0.0')).toEqual(true);
    expect(compareSemanticVersion('1.1.0', '1.10.0')).toEqual(true);
  });

  it('returns false if the right is equal to left', () => {
    expect(compareSemanticVersion('2.0.0', '2.0.0')).toEqual(false);
    expect(compareSemanticVersion('1.0.1', '1.0.1')).toEqual(false);
  });

  it('returns false if right is less than left', () => {
    expect(compareSemanticVersion('2.0.0', '1.0.0')).toEqual(false);
    expect(compareSemanticVersion('1.3.1', '1.2.1')).toEqual(false);
  });
});
