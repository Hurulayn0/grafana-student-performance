
describe('Student Performance Calculations', () => {
  const grades = [92, 85, 76, 58, 43, 91, 67, 52, 88, 74, 39, 95, 61, 47, 83];

  test('should calculate total students', () => {
    expect(grades.length).toBe(15);
  });

  test('should calculate average grade', () => {
    const average =
      grades.reduce((sum, grade) => sum + grade, 0) /
      grades.length;

    expect(average.toFixed(1)).toBe('70.1');
  });

  test('should calculate passed students', () => {
    const passed = grades.filter((grade) => grade >= 60);

    expect(passed.length).toBe(10);
  });

  test('should calculate failed students', () => {
    const failed = grades.filter((grade) => grade < 60);

    expect(failed.length).toBe(5);
  });

  test('should calculate pass rate', () => {
    const passed = grades.filter((grade) => grade >= 60);
    const passRate = (passed.length / grades.length) * 100;

    expect(passRate.toFixed(1)).toBe('66.7');
  });

  test('should filter students by passing grade', () => {
    const passingGrade = 90;
    const passed = grades.filter((grade) => grade >= passingGrade);

    expect(passed.length).toBe(3);
  });
});
