// eslint-disable-next-line @next/next/no-img-element
export function PhotoDisplay({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{ maxWidth: "100vw", maxHeight: "100vh", width: "auto", height: "auto" }}
    />
  );
}
