
import React, { useState } from 'react';
import { PanelProps, FieldType } from '@grafana/data';
import { SimpleOptions } from '../types';

import {
  median,
  standardDeviation,
  gradeDistribution,
  topStudents,
  bottomStudents,
  simulatePassRate,
  clusterStudents,
} from '../performanceAnalysis';

interface Props extends PanelProps<SimpleOptions> {}

interface Student {
  id: string;
  name: string;
  grade: number;
}

export const SimplePanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
}) => {
  const [simulationGrade, setSimulationGrade] = useState<number | null>(
    null
  );

  const passingGrade = Math.min(
    100,
    Math.max(0, options.passingGrade ?? 60)
  );

  const resultFilter = options.resultFilter ?? 'all';
  const chartColor = options.chartColor ?? '#8B5CF6';
  const showAverage = options.showAverage ?? true;
  const showPassRate = options.showPassRate ?? true;

  const students: Student[] = [];

  // Read student data from Grafana DataFrames.
  data.series.forEach((frame, frameIndex) => {
    const gradeField =
      frame.fields.find(
        (field) =>
          field.type === FieldType.number &&
          /grade|score|mark|puan|not/i.test(field.name)
      ) ??
      frame.fields.find(
        (field) => field.type === FieldType.number
      );

    const nameField = frame.fields.find(
      (field) =>
        field.type === FieldType.string &&
        /student|name|öğrenci|isim/i.test(field.name)
    );

    if (!gradeField) {
      return;
    }

    gradeField.values.forEach((value, rowIndex) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      const grade = Number(value);

      if (
        !Number.isFinite(grade) ||
        grade < 0 ||
        grade > 100
      ) {
        return;
      }

      const studentName = nameField?.values[rowIndex];

      students.push({
        id: `${frameIndex}-${rowIndex}`,
        name:
          studentName !== null &&
          studentName !== undefined &&
          String(studentName).trim() !== ''
            ? String(studentName)
            : `Student ${students.length + 1}`,
        grade,
      });
    });
  });

  // Basic statistics
  const totalStudents = students.length;

  const grades = students.map((student) => student.grade);

  const averageGrade =
    totalStudents > 0
      ? grades.reduce((sum, grade) => sum + grade, 0) /
        totalStudents
      : 0;

  const passedStudents = students.filter(
    (student) => student.grade >= passingGrade
  ).length;

  const failedStudents = totalStudents - passedStudents;

  const passRate =
    totalStudents > 0
      ? (passedStudents / totalStudents) * 100
      : 0;

  const filteredStudents = students.filter((student) => {
    if (resultFilter === 'passed') {
      return student.grade >= passingGrade;
    }

    if (resultFilter === 'failed') {
      return student.grade < passingGrade;
    }

    return true;
  });

  // Advanced statistics
  const medianGrade = median(grades);
  const gradeStdDev = standardDeviation(grades);

  const distribution = gradeDistribution(grades);

  const gradeRecords = students.map((student) => ({
    name: student.name,
    grade: student.grade,
  }));

  const topThree = topStudents(gradeRecords);
  const bottomThree = bottomStudents(gradeRecords);

  // AI: one-dimensional K-means clustering
  const clusters = clusterStudents(gradeRecords);

  // What-if simulator
  const selectedSimulationGrade =
    simulationGrade ?? passingGrade;

  const simulatedPassRate = simulatePassRate(
    grades,
    selectedSimulationGrade
  );

  const simulationDifference =
    simulatedPassRate - passRate;

  // Responsive design
  const compact = width < 420;

  const cardStyle: React.CSSProperties = {
    background: 'rgba(139, 92, 246, 0.09)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 14,
    flex: '1 1 120px',
    minWidth: 0,
  };

  const sectionStyle: React.CSSProperties = {
    border: '1px solid rgba(128,128,128,0.2)',
    borderRadius: 12,
    padding: 14,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 14,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7,
  };

  const maxDistribution = Math.max(
    1,
    ...distribution.map((item) => item.count)
  );

  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: compact ? 12 : 20,
        fontFamily: 'Open Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: compact ? 18 : 22,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {options.text || 'Student Performance Monitor'}
        </div>

        <div style={subtitleStyle}>
          Academic Performance Dashboard
        </div>
      </div>

      {/* Main statistics */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={cardStyle}>
          <div style={subtitleStyle}>Total Students</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>
            {totalStudents}
          </div>
        </div>

        {showAverage && (
          <div style={cardStyle}>
            <div style={subtitleStyle}>Average Grade</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: chartColor,
              }}
            >
              {totalStudents
                ? averageGrade.toFixed(1)
                : '—'}
            </div>
          </div>
        )}

        {showPassRate && (
          <div style={cardStyle}>
            <div style={subtitleStyle}>Pass Rate</div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#32A879',
              }}
            >
              {totalStudents
                ? `${passRate.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        )}
      </div>

      {/* Pass/fail summary */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          fontSize: 13,
        }}
      >
        <span>Passing Grade: {passingGrade}</span>
        <span>Passed: {passedStudents}</span>
        <span>Failed: {failedStudents}</span>
      </div>

      {options.showSeriesCount && (
        <div
          data-testid="simple-panel-series-counter"
          style={{
            fontSize:
              options.seriesCountSize === 'lg'
                ? 20
                : options.seriesCountSize === 'md'
                ? 16
                : 12,
          }}
        >
          Number of series: {data.series.length}
        </div>
      )}

      {/* Student grade chart */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          Student Grades
        </div>

        {totalStudents === 0 ? (
          <div style={{ opacity: 0.7 }}>
            No valid grade data found. Provide numeric
            student grades between 0 and 100.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ opacity: 0.7 }}>
            No students match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredStudents.map((student) => {
              const passed =
                student.grade >= passingGrade;

              return (
                <div
                  key={student.id}
                  title={`${student.name}: ${student.grade} - ${
                    passed ? 'Passed' : 'Failed'
                  }`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: compact ? 'wrap' : 'nowrap',
                  }}
                >
                  <div
                    style={{
                      width: compact ? '100%' : 110,
                      fontSize: 12,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {student.name}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      height: 16,
                      minWidth: 60,
                      background: 'rgba(128,128,128,0.15)',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${student.grade}%`,
                        background: passed
                          ? chartColor
                          : '#E58A55',
                        borderRadius: 8,
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      width: 43,
                      fontWeight: 600,
                      textAlign: 'right',
                      fontSize: 12,
                    }}
                  >
                    {student.grade.toFixed(1)}
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      minWidth: 42,
                      color: passed ? '#32A879' : '#E58A55',
                    }}
                  >
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced statistical analysis */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          Advanced Statistics
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={cardStyle}>
            <div style={subtitleStyle}>Median Grade</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {totalStudents
                ? medianGrade.toFixed(1)
                : '—'}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={subtitleStyle}>
              Standard Deviation
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {totalStudents
                ? gradeStdDev.toFixed(2)
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          Grade Distribution
        </div>

        {distribution.map((item) => (
          <div
            key={item.label}
            style={{ marginBottom: 12 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              <span>{item.label}</span>
              <span>{item.count} students</span>
            </div>

            <div
              style={{
                height: 15,
                background: 'rgba(128,128,128,0.15)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${
                    (item.count / maxDistribution) * 100
                  }%`,
                  height: '100%',
                  background: chartColor,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rankings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          Top & Bottom Students
        </div>

        {totalStudents === 0 ? (
          <div style={subtitleStyle}>
            No student data available.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: compact
                ? '1fr'
                : 'repeat(2, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: '#32A879',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Highest Grades
              </div>

              {topThree.map((student, index) => (
                <div
                  key={`${student.name}-${index}`}
                  style={{ fontSize: 12, marginBottom: 7 }}
                >
                  {index + 1}. {student.name} — {student.grade}
                </div>
              ))}
            </div>

            <div>
              <div
                style={{
                  color: '#E58A55',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Lowest Grades
              </div>

              {bottomThree.map((student, index) => (
                <div
                  key={`${student.name}-${index}`}
                  style={{ fontSize: 12, marginBottom: 7 }}
                >
                  {index + 1}. {student.name} — {student.grade}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI K-means clustering */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          AI Performance Insights
        </div>

        <div style={{ ...subtitleStyle, marginBottom: 14 }}>
          K-means clustering groups students with
          similar grades. This is an unsupervised
          machine learning method.
        </div>

        {clusters.length === 0 ? (
          <div style={subtitleStyle}>
            No data available for clustering.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            {clusters.map((cluster, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(139,92,246,0.07)',
                  borderRadius: 10,
                  padding: 12,
                  border:
                    '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {cluster.label}
                </div>

                <div style={{ fontSize: 12 }}>
                  Students: {cluster.students.length}
                </div>

                <div style={{ fontSize: 12 }}>
                  Group Average: {cluster.center.toFixed(1)}
                </div>

                <div
                  style={{
                    ...subtitleStyle,
                    marginTop: 8,
                  }}
                >
                  Members: {cluster.students
                    .map((student) => student.name)
                    .join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalStudents > 0 && (
          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              lineHeight: 1.7,
              opacity: 0.85,
            }}
          >
            <strong>Explainable Insight:</strong>
            {' '}
            The algorithm groups similar grades
            based on their distance from the
            calculated cluster centers.

            <div style={{ marginTop: 7 }}>
              Lower-grade groups may benefit from
              additional revision and academic support.
              Higher-grade groups may be suitable for
              enrichment activities.
            </div>

            <div style={{ marginTop: 7, opacity: 0.75 }}>
              These groups describe current grades only.
              They do not predict future performance
              or diagnose individual learning needs.
            </div>
          </div>
        )}
      </div>

      {/* What-if simulator */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          What-If Simulator
        </div>

        <div style={{ ...subtitleStyle, marginBottom: 14 }}>
          Explore how changing the passing grade
          affects the class pass rate.
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 10,
          }}
        >
          <span>Simulated Passing Grade</span>
          <strong>{selectedSimulationGrade}</strong>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={selectedSimulationGrade}
          onChange={(event) =>
            setSimulationGrade(
              Number(event.currentTarget.value)
            )
          }
          style={{
            width: '100%',
            accentColor: chartColor,
            cursor: 'pointer',
          }}
          aria-label="Simulated passing grade"
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 14,
          }}
        >
          <div style={cardStyle}>
            <div style={subtitleStyle}>
              Current Pass Rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {totalStudents ? `${passRate.toFixed(1)}%` : '—'}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={subtitleStyle}>
              Simulated Pass Rate
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: chartColor,
              }}
            >
              {totalStudents
                ? `${simulatedPassRate.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {totalStudents === 0
            ? 'No data available for simulation.'
            : simulationDifference > 0
            ? `Pass rate increases by ${simulationDifference.toFixed(1)} percentage points.`
            : simulationDifference < 0
            ? `Pass rate decreases by ${Math.abs(simulationDifference).toFixed(1)} percentage points.`
            : 'The pass rate stays unchanged.'}
        </div>

        <button
          type="button"
          onClick={() => setSimulationGrade(null)}
          style={{
            marginTop: 12,
            padding: '7px 12px',
            border: '1px solid rgba(128,128,128,0.4)',
            borderRadius: 7,
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Reset Simulation
        </button>
      </div>

      {/* Developer footer */}
      <div
        style={{
          textAlign: 'center',
          padding: 12,
          borderTop: '1px solid rgba(128,128,128,0.2)',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        Developed by Huriye Kayadelen
      </div>
    </div>
  );
};
