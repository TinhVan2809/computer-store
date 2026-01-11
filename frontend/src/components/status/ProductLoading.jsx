import "../../styles/status.css";
export default function Loading() {
  return (
    <>
      <div className="w-full py-30">
        <div className="loader w-55 h-60 m-auto">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </>
  );
}
