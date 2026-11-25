
export interface GradeRecord {
  name: string;
  grade: number;
}

export interface PerformanceCluster {
  label: string;
  center: number;
  students: GradeRecord[];
}

export interface GradeDistribution {
  label: string;
  count: number;
}

export const average = (grades: number[]): number => {
  if (grades.length === 0) {
    return 0;
  }

  return grades.reduce((a, b) => a + b, 0) / grades.length;
};

export const median = (grades: number[]): number => {
  if (grades.length === 0) {
    return 0;
  }

  const sorted = [...grades].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

export const standardDeviation = (
  grades: number[]
): number => {
  if (grades.length === 0) {
    return 0;
  }

  const mean = average(grades);

  const variance = average(
    grades.map((grade) => (grade - mean) ** 2)
  );

  return Math.sqrt(variance);
};

export const gradeDistribution = (
  grades: number[]
): GradeDistribution[] => {
  return [
    {
      label: '0-49',
      count: grades.filter((g) => g >= 0 && g < 50).length,
    },
    {
      label: '50-69',
      count: grades.filter((g) => g >= 50 && g < 70).length,
    },
    {
      label: '70-84',
      count: grades.filter((g) => g >= 70 && g < 85).length,
    },
    {
      label: '85-100',
      count: grades.filter((g) => g >= 85 && g <= 100).length,
    },
  ];
};

export const topStudents = (
  students: GradeRecord[],
  count = 3
): GradeRecord[] =>
  [...students].sort((a, b) => b.grade - a.grade).slice(0, count);

export const bottomStudents = (
  students: GradeRecord[],
  count = 3
): GradeRecord[] =>
  [...students].sort((a, b) => a.grade - b.grade).slice(0, count);

export const simulatePassRate = (
  grades: number[],
  passingGrade: number
): number => {
  if (grades.length === 0) {
    return 0;
  }

  const passed = grades.filter(
    (grade) => grade >= passingGrade
  ).length;

  return (passed / grades.length) * 100;
};

// One-dimensional K-means clustering.
// Deterministic initialization for reproducible results.
export const clusterStudents = (
  students: GradeRecord[]
): PerformanceCluster[] => {
  if (students.length === 0) {
    return [];
  }

  const sorted = [...students].sort(
    (a, b) => a.grade - b.grade
  );

  const uniqueGrades = [
    ...new Set(sorted.map((student) => student.grade)),
  ];

  const k = Math.min(3, uniqueGrades.length);

  let centers = Array.from({ length: k }, (_, i) => {
    const index =
      k === 1
        ? 0
        : Math.round(
            (i * (uniqueGrades.length - 1)) / (k - 1)
          );

    return uniqueGrades[index];
  });

  for (let iteration = 0; iteration < 30; iteration++) {
    const groups: GradeRecord[][] = Array.from(
      { length: k },
      () => []
    );

    for (const student of sorted) {
      let nearest = 0;
      let minDistance = Infinity;

      centers.forEach((center, index) => {
        const distance = Math.abs(student.grade - center);

        if (distance < minDistance) {
          minDistance = distance;
          nearest = index;
        }
      });

      groups[nearest].push(student);
    }

    const newCenters = centers.map((center, index) =>
      groups[index].length > 0
        ? average(groups[index].map((s) => s.grade))
        : center
    );

    const converged = newCenters.every(
      (center, index) =>
        Math.abs(center - centers[index]) < 0.0001
    );

    centers = newCenters;

    if (converged) {
      break;
    }
  }

  // Assign students to their final nearest centers.
  const finalGroups: GradeRecord[][] = Array.from(
    { length: k },
    () => []
  );

  for (const student of sorted) {
    let nearest = 0;
    let minDistance = Infinity;

    centers.forEach((center, index) => {
      const distance = Math.abs(student.grade - center);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = index;
      }
    });

    finalGroups[nearest].push(student);
  }

  const labels =
    k === 3
      ? ['Lower Grade Group', 'Middle Grade Group', 'Higher Grade Group']
      : k === 2
      ? ['Lower Grade Group', 'Higher Grade Group']
      : ['Single Grade Group'];

  return centers
    .map((center, index) => ({
      center,
      students: finalGroups[index],
    }))
    .filter((group) => group.students.length > 0)
    .sort((a, b) => a.center - b.center)
    .map((group, index) => ({
      label: labels[index] ?? `Group ${index + 1}`,
      center: group.center,
      students: group.students,
    }));
};
