import { IconAvatar, iconAvatarVariants } from './iconAvatar';

import type { VariantProps } from 'class-variance-authority';

type IconAvatarVariant = VariantProps<typeof iconAvatarVariants>['variant'];

interface ContentsCardHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  variant?: IconAvatarVariant;
}

const ContentsCardHeader = ({ icon, title, variant = 'default' }: ContentsCardHeaderProps) => {
  return (
    <div className="flex gap-3 items-center">
      <IconAvatar variant={variant}>{icon}</IconAvatar>
      <span>{title}</span>
    </div>
  );
};

export default ContentsCardHeader;
