import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse container
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        U
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
