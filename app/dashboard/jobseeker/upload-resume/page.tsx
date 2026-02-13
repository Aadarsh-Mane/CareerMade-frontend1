"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UploadResume() {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setResume(data.data?.jobSeeker?.resume || null));
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = (e.currentTarget.elements.namedItem("resume") as HTMLInputElement);
    if (!fileInput.files?.length) return toast.success("Please select a file.");

    const formData = new FormData();
    formData.append("resume", fileInput.files[0]);

    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResume(data.data.resume);
      toast.success("Resume uploaded!");
    } else {
      toast.error(data.message || "Upload failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete resume?")) return;
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/resume`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (res.ok) {
      setResume(null);
      toast.success("Resume deleted");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
      {resume ? (
        <div className="space-y-3">
          <a href={resume.url} target="_blank" className="text-blue-600 underline">{resume.filename}</a>
          <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
            Delete Resume
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-4">
          <input type="file" name="resume" accept=".pdf,.doc,.docx" className="border p-2 w-full rounded" />
          <button disabled={loading} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      )}
    </div>
  );
}
