
import React from 'react';
import { PanelProps, FieldType } from '@grafana/data';
import { SimpleOptions } from '../types';

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
  const passingGrade = Math.min(
    100,
    Math.max(0, options.passingGrade ?? 60)
  );

  const resultFilter = options.resultFilter ?? 'all';
  const chartColor = options.chartColor ?? '#8B5CF6';
  const showAverage = options.showAverage ?? true;
  const showPassRate = options.showPassRate ?? true;

  const students: Student[] = [];

  // Read numeric values from Grafana query results.
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
      const grade = Number(value);

      if (
        value === null ||
        value === undefined ||
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

  // Calculate performance statistics.
  const totalStudents = students.length;

  const averageGrade =
    totalStudents > 0
      ? students.reduce((sum, student) => sum + student.grade, 0) /
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

  // Apply result filter.
  const filteredStudents = students.filter((student) => {
    if (resultFilter === 'passed') {
      return student.grade >= passingGrade;
    }

    if (resultFilter === 'failed') {
      return student.grade < passingGrade;
    }

    return true;
  });

  const compact = width < 420;

  const cardStyle: React.CSSProperties = {
    background: 'rgba(139, 92, 246, 0.09)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 14,
    flex: '1 1 120px',
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: compact ? 17 : 21,
    fontWeight: 700,
    marginBottom: 6,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 12,
    opacity: 0.7,
  };

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
        <div style={titleStyle}>
          {options.text || 'Student Performance Monitor'}
        </div>

        <div style={subtitleStyle}>
          Academic performance overview
        </div>
      </div>

      {/* Statistics */}
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
              {totalStudents > 0
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
              {totalStudents > 0
                ? `${passRate.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
        }}
      >
        <span>Passing Grade: {passingGrade}</span>
        <span>Passed: {passedStudents}</span>
        <span>Failed: {failedStudents}</span>
      </div>

      {/* Series counter */}
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
      <div
        style={{
          border: '1px solid rgba(128,128,128,0.2)',
          borderRadius: 12,
          padding: 14,
          flex: '1 0 auto',
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          Student Grade Distribution
        </div>

        {totalStudents === 0 ? (
          <div style={{ opacity: 0.7, padding: 16 }}>
            No valid grades found. Configure a Grafana
            query returning numeric grades from 0 to 100.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ opacity: 0.7, padding: 16 }}>
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
                  title={`${student.name}: ${student.grade} — ${
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
                      width: 42,
                      textAlign: 'right',
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {student.grade.toFixed(1)}
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      color: passed ? '#32A879' : '#E58A55',
                      minWidth: 44,
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

      {/* Footer - mandatory student name */}
      <div
        style={{
          textAlign: 'center',
          paddingTop: 10,
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
