import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <div style={{ fontSize: "2.5rem" }}>🧭</div>
      <p>We couldn't find that page.</p>
      <Link className="primary" href="/">Go home</Link>
    </div>
  );
}
