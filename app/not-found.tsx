import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty">
        <div style={{ fontSize: "2.5rem" }}>🧭</div>
        <p>We could not find that page.</p>
        <Link className="primary" href="/">Go home</Link>
      </div>
    </div>
  );
}
