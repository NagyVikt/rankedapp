// app/head.tsx
export default function Head() {
  return (
    <>
      {/* Strictly drop referrer on cross-origin loads */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </>
  );
}
