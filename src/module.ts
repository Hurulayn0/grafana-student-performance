
import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(
  SimplePanel
).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Panel title',
      description: 'Title of the student performance panel',
      defaultValue: 'Student Performance Monitor',
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
        ],
      },
      showIf: (config) => config.showSeriesCount,
    })
    .addNumberInput({
      path: 'passingGrade',
      name: 'Passing grade',
      description: 'Minimum grade required to pass',
      defaultValue: 60,
      settings: {
        min: 0,
        max: 100,
        integer: true,
      },
    })
    .addRadio({
      path: 'resultFilter',
      name: 'Result filter',
      defaultValue: 'all',
      settings: {
        options: [
          { value: 'all', label: 'All students' },
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
        ],
      },
    })
    .addColorPicker({
      path: 'chartColor',
      name: 'Chart color',
      description: 'Choose the color of the grade bars',
      defaultValue: '#8B5CF6',
    })
    .addBooleanSwitch({
      path: 'showAverage',
      name: 'Show average grade',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showPassRate',
      name: 'Show pass rate',
      defaultValue: true,
    });
});
