import React from 'react';
import { ClusterName, TopicFormData, FailurePayload } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import { clusterTopicPath } from 'lib/paths';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import {
  formatTopicCreation,
  topicsApiClient,
  createTopicAction,
} from 'redux/actions';
import { useDispatch } from 'react-redux';
import { getResponse } from 'lib/errorHandling';
import { useHistory, useLocation, useParams } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { topicFormValidationSchema } from 'lib/yupExtended';
import PageHeading from 'components/common/PageHeading/PageHeading';

interface RouterParams {
  clusterName: ClusterName;
}

enum Filters {
  NAME = 'name',
  PARTITION_COUNT = 'partitionCount',
  REPLICATION_FACTOR = 'replicationFactor',
  INSYNC_REPLICAS = 'inSyncReplicas',
  CLEANUP_POLICY = 'Delete',
}

const New: React.FC = () => {
  const methods = useForm<TopicFormData>({
    mode: 'all',
    resolver: yupResolver(topicFormValidationSchema),
  });

  const { clusterName } = useParams<RouterParams>();
  const history = useHistory();
  const dispatch = useDispatch();

  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const name = params.get(Filters.NAME) || '';
  const partitionCount = params.get(Filters.PARTITION_COUNT) || 1;
  const replicationFactor = params.get(Filters.REPLICATION_FACTOR) || 1;
  const inSyncReplicas = params.get(Filters.INSYNC_REPLICAS) || 1;
  const cleanUpPolicy = params.get(Filters.CLEANUP_POLICY) || 'Delete';

  const onSubmit = async (data: TopicFormData) => {
    try {
      await topicsApiClient.createTopic({
        clusterName,
        topicCreation: formatTopicCreation(data),
      });
      history.push(clusterTopicPath(clusterName, data.name));
    } catch (error) {
      const response = await getResponse(error as Response);
      const alert: FailurePayload = {
        subject: ['schema', data.name].join('-'),
        title: `${response.message}`,
        response,
      };

      dispatch(createTopicAction.failure({ alert }));
    }
  };

  return (
    <>
      <PageHeading text={search ? 'Copy Topic' : 'Create new Topic'} />
      <FormProvider {...methods}>
        <TopicForm
          topicName={name}
          cleanUpPolicy={cleanUpPolicy}
          partitionCount={Number(partitionCount)}
          replicationFactor={Number(replicationFactor)}
          inSyncReplicas={Number(inSyncReplicas)}
          isSubmitting={methods.formState.isSubmitting}
          onSubmit={methods.handleSubmit(onSubmit)}
        />
      </FormProvider>
    </>
  );
};

export default New;
