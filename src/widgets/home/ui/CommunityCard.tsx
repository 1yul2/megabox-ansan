import { useQuery } from '@tanstack/react-query';
import { MessageSquare, SquarePlus } from 'lucide-react';
import { Link } from 'react-router';

import { postQueries } from '@/entities/post/api/queries';
import ComunityList from '@/features/home/ui/CommunityList';
import { Button } from '@/shared/components/ui/button';
import ContentsCard from '@/shared/components/ui/ContentsCard';
import ContentsCardHeader from '@/shared/components/ui/ContentsCardHeader';
import { ROUTES } from '@/shared/constants/routes';

const CommunityCard = () => {
  const { data: posts = { items: [] } } = useQuery(postQueries.allPosts());

  return (
    <ContentsCard
      title="커뮤니티"
      profile={<ContentsCardHeader icon={<MessageSquare />} title="커뮤니티" variant="blue" />}
      action={
        <Link to={ROUTES.COMMUNITY}>
          <Button variant="ghost" size="icon">
            <SquarePlus />
          </Button>
        </Link>
      }
    >
      {posts.items.length > 0
        ? posts.items.map((post) => <ComunityList key={post.id} post={post} />)
        : '작성된 게시물이 없습니다.'}
    </ContentsCard>
  );
};

export default CommunityCard;
