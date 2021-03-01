//@ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import FormSelect from '../components/FormField/FormSelect';
import defaults from 'lodash/defaults';
import { MetricsQuery, ScenarioProps } from '../types';
import difference from 'lodash/difference';
import FormSwitch from '../components/FormField/FormSwitch';
import KeyValueControl from '../components/KeyValueControl';

export const defaultMetricsCompositeQuery: Partial<MetricsQuery> = {
  baseLine: true,
  showMultiline: false,
  dimensions: [{ key: null, value: null }],
};

const MetricsCompositeQueryEditor = (props: ScenarioProps<MetricsQuery>) => {
  const { onChange, onRunQuery, datasource, metricsList } = props;
  const query = defaults(props.query, defaultMetricsCompositeQuery);
  const [propertiesOptions, setPropertiesOptions] = useState([]);
  const [availableOptions, setAvailableOptions] = useState([]);

  const getValues = useCallback(name => datasource.getMetricsPropVal(query.metricName, name), [query.metricName]);

  useEffect(() => {
    /* Request available propertyNames by selected metrics */
    if (query.metricName) {
      // Reset previous selections:
      onChange({ ...query, dimensions: defaultMetricsCompositeQuery.dimensions });
      datasource.getPropertiesDict(query.metricName).then(({ properties, propertyValues }) => {
        setPropertiesOptions(properties);
      });
    }
  }, [query.metricName]);

  useEffect(() => {
    /* Reduce already selected propertyNames from available properties */
    if (propertiesOptions) {
      let choseOptions = query.dimensions.map(d => d.key); // options were already chose and are not available anymore
      const availableOptions = difference(propertiesOptions, choseOptions).map(value => ({ label: value, value }));
      setAvailableOptions(availableOptions);
    }
  }, [propertiesOptions, query.dimensions]);

  const onFormChange = useCallback(
    (key, value, forceRunQuery = false) => {
      const newQuery = { ...query, [key]: value?.value ?? value };
      onChange(newQuery);
      onRunQuery();
    },
    [query]
  );

  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form gf-form--grow">
          <FormSelect
            isClearable
            inputWidth={0}
            label={'Measure'}
            tooltip={'Select a metric.'}
            value={query.metricName}
            options={metricsList}
            onChange={value => onFormChange('metricName', value)}
          />
        </div>
        <div className="gf-form">
          <FormSwitch
            labelWidth={9}
            label={'Include baseline'}
            tooltip={'Include baseline'}
            value={query.baseLine}
            onChange={e => onFormChange('baseLine', e?.currentTarget?.checked)}
          />
          <FormSwitch
            label={'Multiline Mode'}
            labelWidth={9}
            tooltip={'Shows all metrics on the single chart together'}
            value={query.showMultiline}
            onChange={e => onFormChange('showMultiline', e?.currentTarget?.checked)}
          />
        </div>
      </div>
      {query.metricName && (
        <KeyValueControl
          key={query.metricName}
          dimensionsQuery={query.dimensions}
          onChangeQuery={value => onFormChange('dimensions', value)}
          availableDimensionsNames={availableOptions}
          getValues={getValues}
        />
      )}
    </>
  );
};

export default MetricsCompositeQueryEditor;