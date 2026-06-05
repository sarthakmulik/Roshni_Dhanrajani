interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  )
}

export function EventCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <Skeleton height="200px" borderRadius="0" />
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Skeleton height="14px" width="80px" />
        <Skeleton height="22px" />
        <Skeleton height="16px" width="60%" />
        <Skeleton height="16px" width="40%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <Skeleton height="20px" width="80px" />
          <Skeleton height="40px" width="120px" borderRadius="999px" />
        </div>
      </div>
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        borderRadius: '16px',
        padding: '32px',
        minWidth: '340px',
      }}
    >
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} width="16px" height="16px" borderRadius="50%" />)}
      </div>
      <Skeleton height="16px" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" width="80%" style={{ marginBottom: '8px' }} />
      <Skeleton height="16px" width="60%" style={{ marginBottom: '20px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton width="44px" height="44px" borderRadius="50%" />
        <Skeleton width="120px" height="16px" />
      </div>
    </div>
  )
}
