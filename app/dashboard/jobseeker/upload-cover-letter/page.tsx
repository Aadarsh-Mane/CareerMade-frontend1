"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UploadCoverLetter() {
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCoverLetter(data.data?.jobSeeker?.coverLetter || null));
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = (e.currentTarget.elements.namedItem("coverLetter") as HTMLInputElement);
    if (!fileInput.files?.length) return toast.success("Please select a file.");

    const formData = new FormData();
    formData.append("coverLetter", fileInput.files[0]);

    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCoverLetter(data.data.coverLetter);
      toast.success("Cover letter uploaded!");
    } else {
      toast.error(data.message || "Upload failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete cover letter?")) return;
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/cover-letter`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (res.ok) {
      setCoverLetter(null);
      toast.success("Cover letter deleted");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Cover Letter</h2>
      {coverLetter ? (
        <div className="space-y-3">
          <a href={coverLetter.url} target="_blank" className="text-blue-600 underline">{coverLetter.filename}</a>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Delete Cover Letter
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-4">
          <input type="file" name="coverLetter" accept=".pdf,.doc,.docx" className="border p-2 w-full rounded" />
          <button disabled={loading} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      )}
    </div>
  );
}
