import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Image {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface ImagesResponse {
  after: string;
  data: Image[];
}

export default function Home(): JSX.Element {
  const requestImages = async ({
    pageParam = null,
  }): Promise<ImagesResponse> => {
    const request = await api.get(`/api/images`, {
      params: {
        after: pageParam,
      },
    });

    return request.data;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', requestImages, {
    getNextPageParam: lastPage => lastPage?.after ?? null,
  });

  const formattedData = useMemo(() => {
    const formmated = data?.pages.flatMap(imageData => {
      return imageData.data.flat();
    });

    return formmated;
  }, [data]);

  if (isLoading && !isError) {
    return <Loading />;
  }

  if (!isLoading && isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Button onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
