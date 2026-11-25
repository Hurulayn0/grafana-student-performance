
import {
  average,
  median,
  standardDeviation,
  gradeDistribution,
  topStudents,
  bottomStudents,
  simulatePassRate,
  clusterStudents,
} from './performanceAnalysis';

const grades = [92, 85, 76, 58, 43, 91, 67, 52, 88, 74, 39, 95, 61, 47, 83];

const students = grades.map((grade, index) => ({
  name: `Student ${index + 1}`,
  grade,
}));

describe('Performance Analysis', () => {
  test('calculates average grade', () => {
    expect(average(grades)).toBeCloseTo(70.1, 1);
  });

  test('calculates median grade', () => {
    expect(median(grades)).toBe(74);
  });

  test('calculates standard deviation', () => {
    expect(standardDeviation(grades)).toBeGreaterThan(0);
  });

  test('calculates grade distribution', () => {
    const distribution = gradeDistribution(grades);
    expect(distribution.reduce((sum, d) => sum + d.count, 0)).toBe(15);
  });

  test('finds top three students', () => {
    const top = topStudents(students);
    expect(top.map((s) => s.grade)).toEqual([95, 92, 91]);
  });

  test('finds bottom three students', () => {
    const bottom = bottomStudents(students);
    expect(bottom.map((s) => s.grade)).toEqual([39, 43, 47]);
  });

  test('simulates passing grade changes', () => {
    expect(simulatePassRate(grades, 60)).toBeCloseTo(66.7, 1);
    expect(simulatePassRate(grades, 50)).toBeCloseTo(80, 0);
  });

  test('K-means assigns all students to clusters', () => {
    const clusters = clusterStudents(students);
    expect(clusters.length).toBe(3);
    expect(
      clusters.reduce((sum, c) => sum + c.students.length, 0)
    ).toBe(15);
  });

  test('handles empty data', () => {
    expect(average([])).toBe(0);
    expect(median([])).toBe(0);
    expect(clusterStudents([])).toEqual([]);
  });
});
