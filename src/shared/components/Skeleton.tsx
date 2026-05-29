const Skeleton = ({
  h = 'h-4',
  w = 'w-full',
  rounded = 'rounded',
}: {
  h?: string;
  w?: string;
  rounded?: string;
}) => (
  <div
    className={`${h} ${w} ${rounded} bg-gray-200 dark:bg-gray-700 animate-pulse`}
  />
);

export { Skeleton };
