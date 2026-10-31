import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <>
      <h1 className="hero">Turn your notes into <span className="grad">flashcards</span> in seconds.</h1>
      <p className="sub">Upload a PDF or paste your notes. Memora picks out what matters most and what exams love to ask.</p>
      <UploadForm />
    </>
  );
}
