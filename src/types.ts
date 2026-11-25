
type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  // Existing options
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;

  // Student performance settings
  passingGrade: number;
  resultFilter: 'all' | 'passed' | 'failed';
  chartColor: string;
  showAverage: boolean;
  showPassRate: boolean;
}
